import {
  ExternalHyperlink,
  HeadingLevel,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { BorderDivider, campaignGetParam, consolePicker } from "./utils";
import { aiModel, assistant, openai } from "./openai";

let title = "";

const generateAiTitle = async (cv: string, job_description: string) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are a CV writer. You will be given a CV and a Job Description. Output a job title for the CV. You can use the job description to tailor the title but don't make it too specific. The output should be a plain text to be placed inside a docx file.",
      },
      {
        role: "assistant",
        content: assistant,
      },
      {
        role: "user",
        content: `CV
          ${cv}
          Job Description
          ${job_description}
        `,
      },
    ],
  });
  return result.choices[0].message.content?.trim() as string;
};

const generateTitle = async (
  cv: string,
  positions: string[],
  job_description: string
): Promise<string> => {
  if (title) return title;
  const job_titles: string[] = [...positions];
  job_titles.unshift(await generateAiTitle(cv, job_description));
  let job_title = await consolePicker(job_titles, "Job title");
  while (!job_title) {
    job_titles.unshift(await generateAiTitle(cv, job_description));
    job_title = await consolePicker(job_titles, "Summary");
  }
  title = job_title;
  return job_title as string;
};

export const headerSectionBuilder = async (
  meta: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    website: string;
    email: string;
    dob: string;
    positions: string[];
    google_analytics_tag: string;
    languages: {
      Arabic: string;
      English: string;
    };
  },
  company_name: string,
  cv: string,
  job_description: string,
  type: "cv" | "cover_letter",
  isTestRun = false
) => [
  new Paragraph({
    alignment: "center",
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({
        text: `${meta.first_name} ${meta.last_name}`,
        bold: true,
        allCaps: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: "center",
    children: [
      new TextRun({
        text: isTestRun
          ? meta.positions[0]
          : await generateTitle(cv, meta.positions, job_description),
        color: "#000000",
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    border: type === "cv" ? BorderDivider(8) : {},
  }),
  new Paragraph({
    children: [
      new TextRun({
        size: "9pt",
        children: [`Tel: ${meta.phone} - ${meta.address}`, new Tab()],
      }),
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: meta.website,
            style: "Hyperlink",
          }),
        ],
        link: `${meta.website}${meta.google_analytics_tag}${campaignGetParam(
          company_name
        )}`,
      }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: 0,
      },
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        size: "9pt",
        children: [
          `Email: ${meta.email}`,
          new Tab(),
          `Arabic: ${meta.languages.Arabic}`,
        ],
      }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: 0,
      },
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        size: "9pt",
        children: [
          `DoB: ${meta.dob}`,
          new Tab(),
          `English: ${meta.languages.English}`,
        ],
      }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: 0,
      },
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
    border: type === "cover_letter" ? BorderDivider(8) : {},
  }),
];
