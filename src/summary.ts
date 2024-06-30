import { Paragraph } from "docx";
import { aiModel, assistant, openai } from "./openai";
import { Title, consolePicker } from "./utils";

const generateAiSummary = async (cv: string, job_description: string) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are a CV writer. You will be given a CV and a Job Description. Output a short summary of the CV to put on the summary section on the CV. You can use the job description to tailor the summary but don't make it too specific. Don't mention the company name or any other specific details. Don't focus on the education unless explicitly mentioned in the job description. Keep it around 5 sentences. Output the summary and nothing else. The output should be a plain text to be placed inside a docx file.",
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

const generateSummary = async (
  original_summary: string,
  cv: string,
  job_description: string
): Promise<string> => {
  const summaries: string[] = [original_summary];
  summaries.unshift(await generateAiSummary(cv, job_description));
  let summary = await consolePicker(summaries, "Summary");
  while (!summary) {
    summaries.unshift(await generateAiSummary(cv, job_description));
    summary = await consolePicker(summaries, "Summary");
  }
  return summary as string;
};

export const summarySectionBuilder = async (
  original_summary: string,
  cv: string,
  job_description: string,
  isTestRun = false
) => {
  const summary = isTestRun
    ? original_summary
    : await generateSummary(original_summary, cv, job_description);
    
  return [
    Title("Summary", 0),
    new Paragraph({
      alignment: "both",
      text: summary,
    }),
  ];
};