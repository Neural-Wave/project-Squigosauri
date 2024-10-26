import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const openai = new OpenAI({
  apiKey:
    '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',
  dangerouslyAllowBrowser: true
});

const InterviewQuestions = z.object({
  jobTitle: z.string(),
  company: z.string(),
  salary: z.string(),
  startDate: z.string(),
  location: z.string(),
  seniority: z.string(),
  softSkills: z.array(z.string()),
  hardSkills: z.array(z.string())
});

const Skills = z.object({
  softSkills: z.array(
    z.object({
      skill: z.string(),
      questions: z.array(z.string())
    })
  ),
  hardSkills: z.array(
    z.object({
      skill: z.string(),
      questions: z.array(z.string())
    })
  )
});

const AnswerValidation = z.object({
  answer: z.string(),
  validation: z.string(),
  needFurtherInformation: z.boolean(),
  followupQuestion: z.string()
});

export type InterviewData = {
  jobTitle: string;
  text: string;
  company: string;
  salary: string;
  startDate: string;
  location: string;
  seniority: string;
  softSkills: string[];
  hardSkills: string[];
  questions?: SkillsType;
};

export type SkillsType = {
  softSkills: {
    skill: string;
    questions: string[];
  }[];
  hardSkills: {
    skill: string;
    questions: string[];
  }[];
};

export type AnswerValidationType = {
  validation: string;
  needFurtherInformation: boolean;
  followupQuestion: string;
};

export const generateInterviewQuestion = (jobOffer: string) => {
  const systemPrompt =
    'Extract the relevant information from the job offer list the soft and hard skills needed to succeed in said position.';

  const res = openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: jobOffer
      }
    ],
    response_format: zodResponseFormat(InterviewQuestions, 'interviewQuestions')
  });

  return res;
};

export const getSkillQuestions = (jobTitle: string, softSkills: string[], hardSkills: string[]) => {
  const systemPrompt = 'Generate questions for each soft and hard skills.';

  const res = openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `JOB TITLE: ${jobTitle}\n\nSOFT SKILLS\n-${softSkills.join('\n-')}\n\nHARD SKILLS\n-${hardSkills.join('\n-')}`
      }
    ],
    response_format: zodResponseFormat(Skills, 'skills')
  });

  return res;
};

export const validateAnswer = (
  interviewData: InterviewData,
  history: ChatCompletionMessageParam[],
  skill: string,
  question: string,
  answer: string
) => {
  const systemPrompt = `You are a HR specialist having an interview with a candidate for a ${interviewData.seniority} seniority ${interviewData.jobTitle} position, with location in ${interviewData.location}. 
  You will have to validate the user's answers to your question and answer accodingly.
  If you feel you need to have more information from the candidate on the topic you asked, set the 'needFurtherInformation' key to true and come up with a followup question. Make sure to keep the candidate on track.
  Otherwise if you feel that the user was exhaustive enough or cannot give more valuable answers, set it to false and come up with short and concise followup answer.`;

  const res = openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      ...history,
      {
        role: 'assistant',
        content: `Speaking about the skill "${skill}". ${question}`
      },
      {
        role: 'user',
        content: answer
      }
    ],
    response_format: zodResponseFormat(AnswerValidation, 'validation')
  });

  return res;
};

export const mockJobOffer1 = `# Fullstack Software Engineer - Example Job for Neuralwave

**Job Title:** Fullstack Engineer (TypeScript/Node.js)

**Location:** Remote/Hybrid

**Company:** Acme Inc.

---

### About Us:

At **Acme Inc.**, we are revolutionizing the [industry/field] by building scalable, innovative solutions that make a global impact. As a fast-growing tech company, we're looking for passionate engineers to help us continue shaping the future of [industry]. If you are looking for a dynamic environment where your contributions have real impact, this is the place for you.

### What You'll Do:

As a **Fullstack Engineer**, you will be a key contributor to our development team, working on a diverse range of exciting projects that utilize cutting-edge technology. You will collaborate with designers, front-end developers, and product managers to deliver high-quality, scalable applications. Your primary focus will be working on both server-side and client-side logic, ensuring smooth and efficient user experiences.

### Responsibilities:

- Design, build, and maintain scalable full-stack applications using **TypeScript** and **Node.js**.
- Develop RESTful APIs and integrate with third-party services.
- Collaborate with front-end engineers to deliver robust, user-friendly applications.
- Write clean, maintainable, and efficient code.
- Work in an agile team, participating in sprints and code reviews.
- Optimize applications for performance and scalability.
- Troubleshoot and debug complex issues across both back-end and front-end.
- Stay updated on the latest trends and best practices in full-stack development.

### What We're Looking For:

- Strong proficiency in **TypeScript** and **Node.js**.
- Solid understanding of modern front-end technologies, such as **React** or **Vue.js**.
- Experience with **RESTful APIs**.
- Knowledge of databases such as **PostgreSQL**, **MongoDB**, or similar.
- Familiarity with **Docker** and **Kubernetes** is a plus.
- Experience with version control systems like **Git**.
- Understanding of agile methodologies and CI/CD pipelines.
- Excellent problem-solving skills and attention to detail.
- Good communication skills and ability to work in a team.

### Bonus Skills:

- Experience with cloud platforms like **AWS**, **Google Cloud**, or **Azure**.
- Familiarity with GraphQL and WebSockets.
- Knowledge of serverless architecture.

### Why Acme Inc.?

- Competitive salary and benefits package.
- Remote-first culture with flexible working hours.
- Opportunity to work on impactful projects with cutting-edge technology.
- Collaborative and supportive team environment.
- Continuous learning and professional development opportunities.

---

Join us at **Acme Inc.** and be part of a team where your work truly makes a difference!

---

**Acme Inc.** is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.`;

export const mockJobOffer2 = `# Sr. Frontend Engineer (m/w/x)

## **🚀 Why PastaHR?**

At [**PastaHR**](https://pastahr.com), we help companies hire skilled workers more easily and much faster (e.g., nurses, truck drivers, electricians, and thousands of other jobs). 🧑‍🔧👷🧑‍🏭👩‍⚕️🧑‍🌾

Our AI-powered software simplifies applications and speeds up hiring processes directly on chat platforms candidates use daily like WhatsApp or Instagram.

We are a [**Top 100 Swiss Startup**](https://www.top100startups.swiss/index.cfm?CFID=140033894&CFTOKEN=2eb3e5d443d32f6b-EAC745C9-A0B2-18F3-CE8FD705A2C3ACC7&page=136404&event_id=9803) based in Zurich and within less than 1.5 years we acquired well-known customers such as [**Coop**](https://www.coop.ch/de/), [**Siemens**](https://www.siemens.com/ch/de.html), [**Helvetia**](http://helvetia.ch), [**SV Group**](http://sv-group.com), [**Meier Tobler**](https://www.meiertobler.ch/de), [**Universitätsklinik Balgrist**](https://www.balgrist.ch/) or [**Autogrill**](https://autogrill.ch/).

Our [**team**](https://www.pastahr.com/en/about#:~:text=Learn%20more-,OUR%20TEAM,-Dedicated%20to%20more) consists of ex-Founders, Startup Operators, Google, VC, Consultants and we have rockstar [**advisors & investors**](https://www.pastahr.com/en/about#:~:text=Fortune%20500%20companies.-,OUR%20ADVISORS,-Hermann%20Arnold). Learn more about us here: 

[PastaHR: Applications and Communication via WhatsApp and Instagram](https://www.pastahr.com/en/about)

- *More about PastaHR*
    
    [Startup-Serie Upbeat: Pasta HR bringt Innovation im Rekrutierungsprozess | Handelszeitung](https://www.handelszeitung.ch/podcasts/upbeat/pastahr-innovation-im-rekrutierungsprozess-durch-soziale-medien-702847)
    
    [Pasta Software Studio AG (PastaHR)](https://www.top100startups.swiss/pasta-software-studio-ag-pastahr)
    

## Who are you?

- You love to craft intuitive and beautiful software and have an eye for design.
- You are an expert when it comes to frontend but have worked across the stack (DBs, APIs, Authentication …).
- You have experience with React/Nextjs and TypeScript. If not, we are definitely open if you mostly worked with similar technologies (e.g. Vue, Angular …). However, you just need to learn very fast 😉
- The depth and quality of your experience matter more to us than the duration. However, you should have a minimum of **three years of professional development experience.**
- At PastaHR we are driven to achieve great things! Therefore, **you are searching for a very high-pace environment, where the bars are set very high, and you take on a lot of responsibility from day one.**
- We believe that past achievements and work reveal much about a candidate's skills and motivation. So be ready to showcase your most impressive projects!

*Nice to have*

- Experience in a high-growth SaaS company
- Hands-on design experience
- Fluent in German

## What is your role?

- As a Fullstack Engineer (Frontend Focus), you will be a leading part in building out our frontend experience for recruiters working with PastaHR. This includes our chat inbox, application tracking functionality and much much more to enable recruiters to reach, attract and hire deskless workers.
- At the same time, your job will also include more backend related work like authentication, working with databases or deployments.
- You will **not** just work down a list of weekly tasks but will contribute much further than just code! You will be part of the design process by gathering requirements, planning and ideating from the start of a project.
- You will ship high quality work very fast and see the impact of your work from day one.

## What do we offer?

- **Impact & Growth:** At PastaHR you'll get the possibility to shape a company from the earliest days and grow with us. We get things & decisions done in days instead of weeks.
- **Responsibility:** From day one on, you'll fully own your own projects and get the chance to build up a team.
- **Freedom & Flexibility:** We give you a lot of freedom and flexibility about how you do your work. Things just need to get done.
- **Technology:** Work with the newest tools, technologies and gadgets (e.g. choose your own device)
- **Vacation:** We offer 25 paid vacation days per year.
- **Salary:** A competitive compensation based on a meritocracy instead of politics
- **Equity:** We offer attractive equity packages to all our full-time employees.
- **Other benefits:** Fast decision processes, bi-weekly company lunches, merch etc.

## How do we work?

- **Customer centricity:** With everything we do, we try to delight our customers and users.
- **Ownership:** We are a team of doers who take on responsibility and ownership proactively, work independently, and get things done (well) with little oversight.
- **Excellence & Speed:** We don't want to be average. That's why we strive for excellence and are obsessed with speed. We treat issues only with the complexity they deserve, and do not overcomplicate/over-discuss things.
- **Teamwork:** We win and lose as a team. Egoists are not accepted.
- **Fun:** We don't just work for the sake of working. Besides non-work related things we do as a team regularly (dinners, offsites etc.), we want to have fun every day and don't take things too seriously.
- **Hybrid Work:** We don't offer any fully remote positions. We believe in the early days of a company working together in the same room and having team events regularly is extremely important. You can work from home, but we are looking for people who want to be part of and shape our company and culture, not solely through video calls.

## ✅ PastaHR is for you, if:

- You want to have a lot of responsibility and have a big impact from the earliest days on
- You are up for a challenge with an immense learning curve
- You aim to grow a lot together with the company in a short period of time
- You like to work in a young, dynamic team and have lots of fun

## 🚫 PastaHR is not for you, if:

- You don't want a challenge, learn a ton and grow with the company
- You need clear structures in the team and a lot of guidance
- Your preferred work environment consists primarily of remote work/home office
- You are in search of a more laid-back workplace`;
