export interface VoiceProfile {
  id: string;
  name: string;
  region: 'US' | 'UK';
  gender: 'Male' | 'Female';
  description: string;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  // US Voices (20)
  { id: 'rachel', name: 'Rachel', region: 'US', gender: 'Female', description: 'Warm and engaging American voice' },
  { id: 'domi', name: 'Domi', region: 'US', gender: 'Female', description: 'Clear and professional American voice' },
  { id: 'bella', name: 'Bella', region: 'US', gender: 'Female', description: 'Friendly and articulate American voice' },
  { id: 'antoni', name: 'Antoni', region: 'US', gender: 'Male', description: 'Confident and authoritative American voice' },
  { id: 'elli', name: 'Elli', region: 'US', gender: 'Female', description: 'Expressive and dynamic American voice' },
  { id: 'josh', name: 'Josh', region: 'US', gender: 'Male', description: 'Natural and conversational American voice' },
  { id: 'arnold', name: 'Arnold', region: 'US', gender: 'Male', description: 'Deep and resonant American voice' },
  { id: 'adam', name: 'Adam', region: 'US', gender: 'Male', description: 'Professional and clear American voice' },
  { id: 'sam', name: 'Sam', region: 'US', gender: 'Male', description: 'Versatile and engaging American voice' },
  { id: 'arnold', name: 'Arnold', region: 'US', gender: 'Male', description: 'Strong and commanding American voice' },
  { id: 'clyde', name: 'Clyde', region: 'US', gender: 'Male', description: 'Smooth and polished American voice' },
  { id: 'dave', name: 'Dave', region: 'US', gender: 'Male', description: 'Friendly and approachable American voice' },
  { id: 'fin', name: 'Fin', region: 'US', gender: 'Male', description: 'Energetic and youthful American voice' },
  { id: 'grace', name: 'Grace', region: 'US', gender: 'Female', description: 'Elegant and sophisticated American voice' },
  { id: 'heidi', name: 'Heidi', region: 'US', gender: 'Female', description: 'Bright and cheerful American voice' },
  { id: 'james', name: 'James', region: 'US', gender: 'Male', description: 'Distinguished and professional American voice' },
  { id: 'jeremy', name: 'Jeremy', region: 'US', gender: 'Male', description: 'Articulate and measured American voice' },
  { id: 'jessie', name: 'Jessie', region: 'US', gender: 'Female', description: 'Confident and clear American voice' },
  { id: 'liam', name: 'Liam', region: 'US', gender: 'Male', description: 'Modern and engaging American voice' },
  { id: 'michael', name: 'Michael', region: 'US', gender: 'Male', description: 'Authoritative and trustworthy American voice' },

  // UK Voices (8)
  { id: 'alice', name: 'Alice', region: 'UK', gender: 'Female', description: 'Refined and articulate British voice' },
  { id: 'george', name: 'George', region: 'UK', gender: 'Male', description: 'Distinguished British voice' },
  { id: 'lily', name: 'Lily', region: 'UK', gender: 'Female', description: 'Clear and elegant British voice' },
  { id: 'harry', name: 'Harry', region: 'UK', gender: 'Male', description: 'Professional British voice' },
  { id: 'charlotte', name: 'Charlotte', region: 'UK', gender: 'Female', description: 'Sophisticated British voice' },
  { id: 'sarah', name: 'Sarah', region: 'UK', gender: 'Female', description: 'Warm and engaging British voice' },
  { id: 'william', name: 'William', region: 'UK', gender: 'Male', description: 'Authoritative British voice' },
  { id: 'thomas', name: 'Thomas', region: 'UK', gender: 'Male', description: 'Polished and clear British voice' },
];

export const DEFAULT_VOICE = 'rachel';
