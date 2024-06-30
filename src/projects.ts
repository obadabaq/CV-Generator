import {
  ExternalHyperlink,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { Title, campaignGetParam, handleDate } from "./utils";
import { ProjectType } from "./cv";

const projectSection = (project: ProjectType, google_analytics_tag: string) => [
  new Paragraph({
    children: [
      new TextRun({
        break: 1,
        text: project.title,
        bold: true,
      }),
      new TextRun({
        children: [new Tab(), handleDate(project.date)],
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
        children: [project.role, new Tab()],
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
    text: `Technologies: ${project.skills.join(", ")}`,
  }),
  new Paragraph({
    text: `Description: ${project.professional_description}`,
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: "URL: ",
      }),
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: project.url,
            style: "Hyperlink",
          }),
        ],
        link: `${project.url}${google_analytics_tag}`,
      }),
    ],
  }),
];

export const projectSectionBuilder = (
  meta: {
    projects: ProjectType[];
    google_analytics_tag: string;
  },
  company_name: string
) => {
  const children = [Title("Most Recent Projects")];
  for (const project of meta.projects.slice(0, 6)) {
    children.push(
      ...projectSection(
        project,
        meta.google_analytics_tag + campaignGetParam(company_name)
      )
    );
  }
  return children;
};
