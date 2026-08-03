import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["seeker", "employer"]).default("seeker"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Client-side registration form: adds a confirm-password field.
export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(""),
});

export const educationSchema = z.object({
  school: z.string().min(1, "School is required"),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startYear: z.string().optional().default(""),
  endYear: z.string().optional().default(""),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
  headline: z.string().max(160).optional().default(""),
  bio: z.string().max(1000).optional().default(""),
  location: z.string().max(120).optional().default(""),
  skills: z.array(z.string()).max(30).optional().default([]),
  experience: z.array(experienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const jobSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  company: z.string().min(1, "Company is required").max(120),
  location: z.string().min(1, "Location is required").max(120),
  salary: z.string().max(60).optional().default(""),
  remote: z.boolean().optional().default(false),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]).default("Full-time"),
  description: z.string().min(10, "Add a longer description").max(5000),
});

export type JobInput = z.infer<typeof jobSchema>;

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  coverNote: z.string().max(2000).optional().default(""),
});

export const postSchema = z.object({
  text: z.string().min(1, "Write something first").max(3000),
  // Set server-side from the upload result (may be a relative dev path), so
  // it's trusted here rather than validated as an absolute URL.
  imageUrl: z.string().optional().default(""),
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  text: z.string().min(1, "Comment cannot be empty").max(1000),
});

const projectSchema = z.object({
  name: z.string().default(""),
  link: z.string().default(""),
  description: z.string().default(""),
});

const certificateSchema = z.object({
  name: z.string().default(""),
  issuer: z.string().default(""),
  year: z.string().default(""),
});

const customItemSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  description: z.string().default(""),
});

const customSectionSchema = z.object({
  heading: z.string().default(""),
  items: z.array(customItemSchema).default([]),
});

export const resumeSchema = z.object({
  title: z.string().min(1, "Give your resume a name").max(120),
  bulletPoints: z.boolean().default(true),
  fullName: z.string().max(120).default(""),
  headline: z.string().max(160).default(""),
  email: z.string().max(160).default(""),
  phone: z.string().max(60).default(""),
  location: z.string().max(120).default(""),
  website: z.string().max(200).default(""),
  summary: z.string().max(2000).default(""),
  skills: z.array(z.string()).max(40).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certificates: z.array(certificateSchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
