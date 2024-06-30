import { Paragraph, TextRun } from "docx";
import { Title, consolePicker } from "./utils";
import { aiModel, openai } from "./openai";

const skillsRange = [6, 8];

const pickMostSuitableSkillsAI = async (
  cv: string,
  job_description: string,
  type: "Soft" | "Hard"
) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content: `You are a CV writer. You will be given a CV and a job description, pick the top ${skillsRange.join(
          " to "
        )} ${type} skills from the CV that are most suitable for the job description. Return the skills as a list, each skill on a line. The output should be a plain text to be placed inside a docx file.`,
      },
      {
        role: "user",
        content: `CV
        ${cv}
        Job Description
        ${job_description}`,
      },
    ],
  });

  const content = result.choices[0].message.content as string;
  return content
    .split("\n")
    .map((item) =>
      item.startsWith("- ") ? item.substring(2).trim() : item.trim()
    )
    .join(", ");
};

const pickMostSuitableSkills = async (
  cv: string,
  job_description: string,
  type: "Soft" | "Hard"
) => {
  const skillsOptions: string[] = [];
  skillsOptions.unshift(
    await pickMostSuitableSkillsAI(cv, job_description, type)
  );
  let selectedSkills = await consolePicker(skillsOptions, type + " Skills");
  while (!selectedSkills) {
    skillsOptions.unshift(
      await pickMostSuitableSkillsAI(cv, job_description, type)
    );
    selectedSkills = await consolePicker(skillsOptions, "Summary");
  }
  return selectedSkills as string;
};

export const skillsSectionBuilder = async (
  cv: string,
  job_description: string,
  meta: {
    soft_skills: string[];
    hard_skills: string[];
  },
  isTestRun = false
) => {
  const children = [Title("Most Notable Skills")];

  const hardSkills = isTestRun
    ? meta.hard_skills.slice(0, 7).join(", ")
    : await pickMostSuitableSkills(cv, job_description, "Hard");

  const softSkills = isTestRun
    ? meta.soft_skills.slice(0, 7).join(", ")
    : await pickMostSuitableSkills(cv, job_description, "Soft");

  // Hard Skills
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          break: 1,
          text: `Hard Skills: `,
          bold: true,
        }),
        new TextRun({
          text: hardSkills,
        }),
      ],
    })
  );

  // Hard Skills
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          break: 1,
          text: `Soft Skills: `,
          bold: true,
        }),
        new TextRun({
          text: softSkills,
        }),
      ],
    })
  );

  return children;
};
