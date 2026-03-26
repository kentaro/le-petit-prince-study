import App from "@/components/App";
import chaptersRaw from "@/data/chapters.json";
import { Chapter } from "@/lib/types";

const chapters = chaptersRaw as Chapter[];

export default function Home() {
  return <App chapters={chapters} />;
}
