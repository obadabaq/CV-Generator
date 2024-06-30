import { aiModel, openai } from "./openai";
import { consolePicker } from "./utils";

const generateAiCoverLetter = async (
  meta: { first_name: string; last_name: string },
  company_name: string,
  cv: string,
  job_description: string
) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are a CV writer. You will be given a CV and a Job Description. Output a cover letter for the CV to apply to the job. You can use the job description to tailor the cover letter. The output should be a plain text to be placed inside a docx file. Add the necessary line breaks to make it look good in the docx file. Start with Dear Hiring Manager, and end with Sincerely, ." +
          meta.first_name +
          " " +
          meta.last_name +
          ". Don't add any address or anything else. Keep it simple as I added a header to the docx file with the required information",
      },
      {
        role: "user",
        content: `CV
              ${cv}
              Company Name
              ${company_name}
              Job Description
              ${job_description}
            `,
      },
    ],
  });
  return result.choices[0].message.content?.trim() as string;
};

export const coverLetterGenerator = async (
  meta: { first_name: string; last_name: string },
  company_name: string,
  cv: string,
  job_description: string
) => {
  const coverLetters: string[] = [];
  coverLetters.unshift(
    await generateAiCoverLetter(meta, company_name, cv, job_description)
  );
  let coverLetter = await consolePicker(coverLetters, "Cover Letter");
  while (!coverLetter) {
    coverLetters.unshift(
      await generateAiCoverLetter(meta, company_name, cv, job_description)
    );
    coverLetter = await consolePicker(coverLetters, "Cover Letter");
  }

  return coverLetter;
};
