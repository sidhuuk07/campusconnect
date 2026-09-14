import { trpc } from "@/lib/trpc";
import type { Announcement } from "@/components/PortalComponents";

export const mockAnnouncements: Announcement[] = [
  { id: "welcome-week", category: "Campus life", title: "Welcome Week is almost here", summary: "Meet your new campus community with five days of pop-ups, society fairs, and low-pressure ways to make your first connections.", publishedAt: "14 Oct 2025", readTime: "3 min read", featured: true },
  { id: "library-hours", category: "Student services", title: "Extended library hours begin Monday", summary: "The central library will stay open until midnight on weekdays through the end of assessment season. Your late-night study spot is sorted.", publishedAt: "12 Oct 2025", readTime: "2 min read" },
  { id: "volunteer-fair", category: "Opportunities", title: "Find your thing at the Volunteer Fair", summary: "More than 30 community partners are joining us this Thursday. Bring a friend, ask questions, and discover a cause that fits.", publishedAt: "10 Oct 2025", readTime: "4 min read" },
  { id: "design-society", category: "Clubs", title: "Design Society opens new member applications", summary: "From zines to service design, the student-led studio is looking for curious makers across every course and discipline.", publishedAt: "08 Oct 2025", readTime: "3 min read" },
  { id: "wellbeing-break", category: "Wellbeing", title: "Take a pause: new wellbeing sessions", summary: "Drop into guided breathwork, quiet study hours, and peer support circles running throughout October.", publishedAt: "06 Oct 2025", readTime: "2 min read" },
  { id: "sports-centre", category: "Sport", title: "Your first week at the Sports Centre", summary: "Try climbing, social badminton, and beginner strength sessions free with your student card this week.", publishedAt: "03 Oct 2025", readTime: "3 min read" },
];

export function useAnnouncements() {
  const query = trpc.announcements.list.useQuery(undefined, { retry: false });
  return { ...query, data: (query.data as Announcement[] | undefined) ?? mockAnnouncements };
}
