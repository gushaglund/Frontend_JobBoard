import Airtable, { Attachment } from 'airtable';

const base = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!);

export interface CandidateProfile {
  id: string;
  name: string;
  headshot: AttachmentField[];
  grade: string;
  undergraduateUniversity: string;
  oneLiner: string;
  undergraduateMajor: string;
  candidateQualities: string[];
  reviewRecommendation: string;
  orderId: string;
  email: string;
  status: string;
  recommendationLevel: string;
}
interface AttachmentField {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

// Helper to fetch status from Candidate-Client Feedback table
export type CandidateStatusStage = 'shortlist' | 'firstRound' | 'finalInterview' | 'offer' | 'done';
export interface CandidateStatusResult {
  value: string;
}

export async function getCandidateStatus(candidateName: string, companyName: string): Promise<CandidateStatusResult> {
  try {
    const records = await base('Candidate-Client Feedback')
      .select({
        filterByFormula: `AND({Candidate-Client} = '${candidateName}-${companyName}')`,  
        maxRecords: 1,  
        view: 'Grid view'
      })
      .all();

    console.log('records_status', records);

    if (records.length === 0) {
      return {
        value: 'No feedback found'
      };
    }

    const record = records[0];
    const value = record.get('Would you like to interview this candidate?') as string;
    return {
      value
    };
  } catch (error) { 
    console.error('Error fetching candidate status:', error);
    return {
      value: 'Error fetching candidate status'
    };
  }
}

export async function getCandidatesByOrderId(orderId: string): Promise<CandidateProfile[]> {
  try {
    console.log('orderId', orderId);
    const records = await base('Candidate-Client Profile')
      .select({
        filterByFormula: `AND({Order ID} = '${orderId}', {Show/Hide} = 'Show')`,
        view: 'Grid view'
      })
      .all();

    console.log('records', records);

    const candidates = await Promise.all(records.map(async record => {
      const orderId = record.get('Order ID') as string;
      const email = record.get('Email') as string;
      const candidateName = record.get('Candidate Name') as string;
      const companyName = record.get('Company Name') as string;
      const status = await getCandidateStatus(candidateName, companyName);
      return {
        id: record.id,
        name: record.get('Candidate Name') as string,
        headshot: (record.get("Headshot") as AttachmentField[]) || null,
        grade: record.get('Grade') as string,
        undergraduateUniversity: record.get('Undergraduate University') as string,
        oneLiner: record.get('One Liner') as string,
        undergraduateMajor: record.get('Undergraduate Major / Minor') as string,
        candidateQualities: record.get('Candidate Qualities') as string[],
        reviewRecommendation: record.get('Reviewer Recommendation Lookup') as string,
        orderId,
        email: record.get('Email') as string,
        status: status.value,
        recommendationLevel: record.get('Recommendation Level') as string,
      };
    }));
    console.log('candidates', candidates);

    // Sort candidates by recommendationLevel (A, B, C)
    const sortedCandidates = candidates.sort((a, b) => {
      const levelA = a.recommendationLevel || 'C'; // Default to C if no level
      const levelB = b.recommendationLevel || 'C';
      
      // Define priority order: A > B > C
      const priority = { 'A': 3, 'B': 2, 'C': 1 };
      
      return priority[levelB as keyof typeof priority] - priority[levelA as keyof typeof priority];
    });

    console.log('sorted candidates by recommendation level:', sortedCandidates);

    return sortedCandidates as CandidateProfile[];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

// Function to update candidate status in Candidate-Client Feedback table
export async function updateCandidateStatus({
  email,
  orderId,
  action,
  currentStage
}: {
  email: string;
  orderId: string;
  action: 'advance' | 'decline';
  currentStage: CandidateStatusStage;
}): Promise<boolean> {
  try {
    console.log('Updating candidate status:', { email, orderId, action, currentStage });

    // Field mapping for each stage
    const fieldMap: { key: CandidateStatusStage; field: string; nextStage: CandidateStatusStage }[] = [
      {
        key: 'shortlist',
        field: 'Would you like to advance this candidate to a first round interview or deny them?',
        nextStage: 'firstRound'
      },
      {
        key: 'firstRound',
        field: 'Would you like to move this candidate to the final interview or deny them?',
        nextStage: 'finalInterview'
      },
      {
        key: 'finalInterview',
        field: 'Would you like to extend an offer to this candidate or deny them?',
        nextStage: 'offer'
      },
      {
        key: 'offer',
        field: 'Did the candidate accept the offer?',
        nextStage: 'done'
      }
    ];

    const advanceValueMap: Record<CandidateStatusStage, string> = {
      shortlist: 'Advance to First Round Interview',
      firstRound: 'Advance to Final Interview',
      finalInterview: 'Extend Offer',
      offer: 'Offer Accepted',
      done: '',
    };

    const currentStageConfig = fieldMap.find(config => config.key === currentStage);
    if (!currentStageConfig) {
      console.error('Invalid current stage:', currentStage);
      return false;
    }

    // Find the Candidate-Client Profile record ID using email and orderId
    const profileRecords = await base('Candidate-Client Profile')
      .select({
        filterByFormula: `AND({Email} = '${email[0]}', {Order ID} = '${orderId}')`,
        maxRecords: 1,
        view: 'Grid view',
      })
      .all();
    if (profileRecords.length === 0) {
      console.error('No matching Candidate-Client Profile found for email and orderId');
      return false;
    }
    const profileRecordId = profileRecords[0].id;

    const filterFormula = `AND({Email} = '${email[0]}', {Order ID (from Candidate-Client Profile)} = '${orderId}')`;

    // First, try to find existing record
    const existingRecords = await base('Candidate-Client Feedback')
      .select({
        filterByFormula: filterFormula,
        maxRecords: 1,
        view: 'Grid view',
      })
      .all();

    // Build updateData so only the current stage field has a value, others are set to 'None'
    const updateData: any = {};
    for (const config of fieldMap) {
      if (config.key === currentStage) {
        if (action === 'advance') {
          updateData[config.field] = advanceValueMap[currentStage];
        } else {
          updateData[config.field] = 'Deny Candidate';
        }
      } else {
        updateData[config.field] = null;
      }
    }

    if (existingRecords.length > 0) {
      // Update existing record
      await base('Candidate-Client Feedback').update(existingRecords[0].id, {
        ...updateData,
        'Candidate-Client Profile': [profileRecordId],
      });
      console.log('Updated existing feedback record');
    } else {
      // Create new record
      const newRecordData = {
        'Candidate-Client Profile': [profileRecordId],
        ...updateData
      };
      await base('Candidate-Client Feedback').create(newRecordData);
      console.log('Created new feedback record');
    }

    return true;
  } catch (error) {
    console.error('Error updating candidate status:', error);
    return false;
  }
}

// Function to hide candidate from the main view
export async function hideCandidate(candidateId: string): Promise<boolean> {
  try {
    await base('Candidate-Client Profile').update(candidateId, {
      'Show/Hide': 'Hide'
    });
    console.log('Candidate hidden successfully');
    return true;
  } catch (error) {
    console.error('Error hiding candidate:', error);
    return false;
  }
} 