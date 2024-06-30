import { Paragraph, Tab, TabStopPosition, TabStopType, TextRun } from "docx";
import { aiModel, openai } from "./openai";
import { Title, consolePicker } from "./utils";
import { ExperienceType } from "./cv";

const tailorJobDescriptionAi = async (
  job_description: string,
  new_job_description: string
) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are a CV writer. You will be given my recent job responsibilities and the job description for the job that I'm applying to. Output a job responsibilities for my latest job that is slightly tailored to the job I'm applying to. Don't mention the company name or any other specific details. Return the job responsibilities as bullet points, each bullet point on a line. Max 5 bullet points. The output should be a plain text to be placed inside a docx file.",
      },
      {
        role: "user",
        content: `Current Job Description
            ${job_description}
            New Job Description
            ${new_job_description}
            `,
      },
    ],
  });
  const content = result.choices[0].message.content as string;
  return content
    .split("\n")
    .map((item) =>
      item.startsWith("- ") ? item.substring(2).trim() : item.trim()
    )
    .join("\n");
};

const tailorJobDescription = async (
  company_name: string,
  job_description: string,
  new_job_description: string
) => {
  const job_descriptions: string[] = [job_description];
  job_descriptions.unshift(
    await tailorJobDescriptionAi(job_description, new_job_description)
  );
  let tailored_job_description = await consolePicker(
    job_descriptions,
    "Job Description for " + company_name
  );
  while (!tailored_job_description) {
    job_descriptions.unshift(
      await tailorJobDescriptionAi(job_description, new_job_description)
    );
    tailored_job_description = await consolePicker(
      job_descriptions,
      "Job Description for " + company_name
    );
  }
  return tailored_job_description.split("\n");
};

const experienceSection = (experiences: ExperienceType) => [
  new Paragraph({
    children: [
      new TextRun({
        break: 1,
        text: experiences.company,
        bold: true,
      }),
      new TextRun({
        children: [new Tab(), experiences.location],
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
        children: [experiences.role, new Tab(), experiences.duration],
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
  ...experiences.responsibilities.map(
    (responsibility) =>
      new Paragraph({
        text: responsibility,
        bullet: {
          level: 0,
        },
      })
  ),
];

export const experienceSectionBuilder = async (
  experiences: ExperienceType[],
  job_description: string,
  isTestRun: boolean = false
) => {
  const children: any[] = [Title("Experience")];

  for (let i = 0; i < experiences.length; i++) {
    const experience = experiences[i];
    const newResponsibilities = isTestRun
        ? experience.responsibilities
        : await tailorJobDescription(
            experience.company,
            experience.responsibilities.join("\n"),
            job_description
          );
      children.push(
        ...experienceSection({
          ...experience,
          responsibilities: newResponsibilities,
        })
      );
  }
  return children;
};
