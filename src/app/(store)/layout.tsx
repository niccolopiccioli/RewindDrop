import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DemoNotice from "@/components/layout/demo-notice";
import CartAvailabilitySync from "@/components/layout/cart-availability-sync";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartAvailabilitySync />
      <Header />
      <main className="flex-1">{children}</main>
      <DemoNotice />
      <Footer />
    </>
  );
}
