import { Toaster } from "sonner";
import { HomeScreen } from "./components/HomeScreen";

export default function App() {
  return (
    <div className="min-h-screen w-full" style={{ background: "#F0F9FF" }}>
      <HomeScreen />
      <Toaster position="bottom-center" />
    </div>
  );
}
