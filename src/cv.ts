import fs from 'fs';

export type ExperienceType = {
  company: string;
  role: string;
  employmentType: "Full-time" | "Part-time";
  locationType: "On-site" | "Remote";
  location: string;
  startDate: string;
  endDate: string;
  image: string;
  website: string;
  responsibilities: string[];
  skills: string[];
} & {
  duration: string;
};

export type EducationType = {
  university: string;
  degree: string;
  specialization: string;
  startDate: string;
  endDate: string;
  grade: string;
  link: string;
  image: string;
};

export type ProjectType = {
  title: string;
  professional_description: string;
  path: string;
  date: string;
  published: boolean;
  keywords: string[];
  image: string;
  type: string;
  skills: string[];
  role: string;
  url: string;
};

type CVType = {
  face_image: string;
  first_name: string;
  last_name: string;
  positions: string[];
  email: string;
  phone: string;
  address: string;
  website: string;
  linked_in: string;
  github: string;
  google_analytics_tag: string;
  dob: string;

  summary: string;
  languages: {
    Arabic: string;
    English: string;
  };
  top_skills: {
    skill: string;
    icon: any;
  }[];
  hard_skills: string[];
  soft_skills: string[];
  experiences: ExperienceType[];
  education: EducationType[];
  features: {
    icon: any;
    title: string;
    description: string;
  }[];
  projects: ProjectType[];
};

export const fetchCV = async (): Promise<CVType> => {
  const data = fs.readFileSync('./src/cvs.json', 'utf-8');
  const jsonData = JSON.parse(data);

  return {
    ...jsonData,
    experiences: jsonData.experiences.map((experience: any) => ({
      ...experience,
      duration: `${experience.startDate} - ${experience.endDate}`,
    })),
  };
};
