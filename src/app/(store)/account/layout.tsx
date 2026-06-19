import AccountNav from "@/components/account/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wide py-8 md:py-12">
      <h1 className="text-display text-2xl font-semibold mb-8">Il mio account</h1>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
