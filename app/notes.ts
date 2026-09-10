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
    title: "Nothing should teleport",
    readTime: "5 min read",
  },
  {
    title: "Ten interviews is enough",
    readTime: "7 min read",
  },
  {
    title: "The system nobody adopted",
    readTime: "11 min read",
  },
];
