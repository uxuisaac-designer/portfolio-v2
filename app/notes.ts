/* The one list of notes. Read the same way app/projects.ts is: a single
   export the page renders, so a note is added in one place.

   `readTime` is written by hand rather than counted, because there is no
   prose behind these yet. It becomes a word count the moment there is. */

export type Note = {
  title: string;
  readTime: string;
};

/* Most recent first, like the work. */
export const notes: Note[] = [
  {
    title: "Everything is a first draft now",
    readTime: "6 min read",
  },
  {
    title: "Deciding is the job",
    readTime: "8 min read",
  },
  {
    title: "Building this portfolio from scratch",
    readTime: "10 min read",
  },
  {
    title: "Consensus is where good ideas go to get safe",
    readTime: "7 min read",
  },
  {
    title: "Nobody was hired for their Figma file",
    readTime: "5 min read",
  },
];
