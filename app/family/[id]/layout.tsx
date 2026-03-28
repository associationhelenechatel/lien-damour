import { ScrollToTop } from "./scroll-to-top";

export default function FamilyMemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}
