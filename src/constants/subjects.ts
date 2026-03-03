// NSC (National Senior Certificate) South African subjects grouped by category
export const SUBJECT_CATEGORIES = [
  {
    category: 'Languages',
    subjects: [
      'Afrikaans Home Language',
      'Afrikaans First Additional Language',
      'English Home Language',
      'English First Additional Language',
      'IsiZulu Home Language',
      'IsiZulu First Additional Language',
      'IsiXhosa Home Language',
      'IsiXhosa First Additional Language',
      'Sesotho Home Language',
      'Sesotho First Additional Language',
      'Sepedi Home Language',
      'Sepedi First Additional Language',
      'Tshivenda Home Language',
      'Tshivenda First Additional Language',
      'Xitsonga Home Language',
      'Xitsonga First Additional Language',
      'SiSwati Home Language',
      'SiSwati First Additional Language',
      'Ndebele Home Language',
      'Ndebele First Additional Language',
    ],
  },
  {
    category: 'Mathematics & Sciences',
    subjects: [
      'Mathematics',
      'Mathematical Literacy',
      'Physical Sciences',
      'Life Sciences',
      'Chemistry',
      'Physics',
      'Biology',
      'Geography',
      'Environmental Studies',
    ],
  },
  {
    category: 'Business & Economics',
    subjects: [
      'Accounting',
      'Business Studies',
      'Economics',
      'History',
      'Tourism',
    ],
  },
  {
    category: 'Technology',
    subjects: [
      'Information Technology',
      'Computer Applications Technology',
      'Technical Mathematics',
      'Technical Sciences',
      'Engineering Graphics and Design',
      'Civil Technology',
      'Electrical Technology',
      'Mechanical Technology',
    ],
  },
  {
    category: 'Arts & Humanities',
    subjects: [
      'Visual Arts',
      'Music',
      'Dramatic Arts',
      'Dance Studies',
      'Philosophy',
      'Religious Studies',
      'Life Orientation',
    ],
  },
  {
    category: 'Agricultural & Consumer',
    subjects: [
      'Agricultural Sciences',
      'Agricultural Management Practices',
      'Agricultural Technology',
      'Consumer Studies',
    ],
  },
];

// Flat list of all subjects
export const NSC_SUBJECTS = SUBJECT_CATEGORIES.flatMap(cat => cat.subjects);

export type NSCSubject = typeof NSC_SUBJECTS[number];
