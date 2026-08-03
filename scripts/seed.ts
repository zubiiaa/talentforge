import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/user";
import { Job } from "../src/models/job";
import { Post } from "../src/models/post";
import { Application } from "../src/models/application";

const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/talentforge";

const DEMO_PASSWORD = "password123";

const demoUsers = [
  {
    name: "Ava Thompson",
    email: "ava@talentforge.dev",
    username: "avathompson",
    role: "employer",
    headline: "Head of Design at Northwind",
    location: "London, UK",
    bio: "Building design teams that ship. Formerly Figma, Stripe.",
    skills: ["Design Leadership", "Product Strategy", "Hiring"],
  },
  {
    name: "Marcus Lee",
    email: "marcus@talentforge.dev",
    username: "marcuslee",
    role: "employer",
    headline: "Engineering Manager at Cloudpeak",
    location: "Berlin, Germany",
    bio: "I care about developer experience and shipping reliable software.",
    skills: ["Engineering Management", "Go", "Kubernetes"],
  },
  {
    name: "Priya Nair",
    email: "priya@talentforge.dev",
    username: "priyanair",
    role: "seeker",
    headline: "Frontend Engineer · React · TypeScript",
    location: "Bangalore, India",
    bio: "Frontend engineer who loves accessible, fast interfaces.",
    skills: ["React", "TypeScript", "Next.js", "Accessibility"],
    experience: [
      {
        title: "Frontend Engineer",
        company: "Razorpay",
        location: "Remote",
        startDate: "2021",
        endDate: "",
        current: true,
        description: "Own the checkout UI used by millions of merchants.",
      },
    ],
    education: [
      { school: "IIT Madras", degree: "B.Tech", field: "Computer Science", startYear: "2015", endYear: "2019" },
    ],
  },
  {
    name: "Diego Santos",
    email: "diego@talentforge.dev",
    username: "diegosantos",
    role: "seeker",
    headline: "Product Designer",
    location: "São Paulo, Brazil",
    bio: "Designing calm, useful products.",
    skills: ["Figma", "Design Systems", "Prototyping"],
  },
];

const jobsByEmployer: Record<string, Array<Record<string, unknown>>> = {
  avathompson: [
    { title: "Senior Product Designer", company: "Northwind", location: "London, UK", salary: "£70k – £90k", remote: true, type: "Full-time", description: "Lead design on our core product. You'll own end-to-end flows, from research to polished UI, and mentor two designers.\n\nRequirements: 5+ years product design, strong systems thinking, portfolio of shipped work." },
    { title: "UX Researcher", company: "Northwind", location: "London, UK", salary: "£55k – £70k", remote: false, type: "Full-time", description: "Plan and run studies that shape our roadmap. Mix of generative and evaluative research." },
    { title: "Design Intern", company: "Northwind", location: "Remote", salary: "£2k/mo", remote: true, type: "Internship", description: "A 6-month internship for a designer early in their career. Real projects, real mentorship." },
  ],
  marcuslee: [
    { title: "Senior Frontend Engineer", company: "Cloudpeak", location: "Berlin, Germany", salary: "€75k – €95k", remote: true, type: "Full-time", description: "Build our customer-facing dashboard in React and TypeScript. You care about performance and DX.\n\nStack: Next.js, TanStack Query, Tailwind." },
    { title: "Backend Engineer (Go)", company: "Cloudpeak", location: "Berlin, Germany", salary: "€80k – €100k", remote: true, type: "Full-time", description: "Design and build the APIs behind our platform. Go, Postgres, Kubernetes." },
    { title: "Platform Engineer", company: "Cloudpeak", location: "Remote", salary: "€85k – €110k", remote: true, type: "Contract", description: "6-month contract to harden our CI/CD and observability." },
    { title: "Part-time Support Engineer", company: "Cloudpeak", location: "Berlin, Germany", salary: "€30/hr", remote: false, type: "Part-time", description: "Help our customers succeed. Technical troubleshooting, some scripting." },
  ],
};

const posts = [
  { author: "priyanair", text: "Just shipped a full accessibility pass on our checkout — keyboard nav, focus management, ARIA the works. Small changes, huge difference for real users. ♿ Happy to share what I learned." },
  { author: "avathompson", text: "We're hiring a Senior Product Designer at Northwind. If you love systems thinking and shipping polished work, come talk to me. Remote-friendly." },
  { author: "diegosantos", text: "Reminder: the best design system is the one your team actually uses. Start smaller than you think." },
  { author: "marcuslee", text: "Hot take: most 'performance problems' are actually too many re-renders. Measure before you optimize." },
  { author: "priyanair", text: "6 months into learning Next.js App Router and server actions genuinely changed how I think about data fetching. Less client state, fewer bugs." },
];

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to MongoDB");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Reset content (keep any real accounts intact).
  await Promise.all([Job.deleteMany({}), Post.deleteMany({}), Application.deleteMany({})]);

  const userIds: Record<string, string> = {};
  for (const u of demoUsers) {
    const doc = await User.findOneAndUpdate(
      { email: u.email },
      { ...u, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    userIds[u.username] = doc!._id.toString();
  }

  // Jobs
  const createdJobIds: string[] = [];
  for (const [username, list] of Object.entries(jobsByEmployer)) {
    for (const job of list) {
      const doc = await Job.create({ ...job, employer: userIds[username] });
      createdJobIds.push(doc._id.toString());
    }
  }

  // Posts with a few likes + comments
  const allUserIds = Object.values(userIds);
  for (const p of posts) {
    await Post.create({
      author: userIds[p.author],
      text: p.text,
      likes: allUserIds.filter(() => Math.random() > 0.4),
      comments:
        Math.random() > 0.5
          ? [{ author: allUserIds[0], text: "Love this — thanks for sharing!" }]
          : [],
    });
  }

  // If a real "Jordan" user exists, wire up demo applications + a saved job for the dashboard.
  const jordan = await User.findOne({ username: "jordanrivera" });
  if (jordan) {
    const target = createdJobIds.slice(0, 3);
    for (const jobId of target) {
      await Application.create({ job: jobId, applicant: jordan._id, coverNote: "Excited about this role!" });
      await Job.updateOne({ _id: jobId }, { $inc: { applicantCount: 1 } });
    }
    jordan.savedJobs = createdJobIds.slice(3, 6).map((id) => new mongoose.Types.ObjectId(id));
    jordan.profileViews = 142;
    if (!jordan.skills?.length) jordan.skills = ["Figma", "Design Systems", "UI/UX", "Prototyping", "User Research"];
    if (!jordan.experience?.length) {
      jordan.experience = [
        {
          title: "Senior Product Designer",
          company: "Lumen Labs",
          location: "Remote",
          startDate: "2022",
          endDate: "",
          current: true,
          description: "Lead designer on the core product, owning research through polished UI. Built the design system now used by 4 squads.",
        },
        {
          title: "Product Designer",
          company: "Brightwave",
          location: "Karachi, Pakistan",
          startDate: "2019",
          endDate: "2022",
          current: false,
          description: "Shipped the onboarding redesign that lifted activation by 24%.",
        },
      ];
    }
    if (!jordan.education?.length) {
      jordan.education = [
        { school: "NUST", degree: "BSc", field: "Software Engineering", startYear: "2015", endYear: "2019" },
      ];
    }
    await jordan.save();
    console.log("Wired demo applications for jordanrivera");
  }

  console.log(`Seeded ${demoUsers.length} users, ${createdJobIds.length} jobs, ${posts.length} posts.`);
  console.log(`Demo login: ava@talentforge.dev / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
