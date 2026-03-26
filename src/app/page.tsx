import App from "@/components/App";
import chaptersRaw from "@/data/chapters.json";
import dictionaryRaw from "@/data/dictionary.json";
import { Chapter } from "@/lib/types";

const chapters = chaptersRaw as Chapter[];
const dictionary = dictionaryRaw as Record<
  string,
  { pos: string; gender: string | null; japanese: string }
>;

export default function Home() {
  return <App chapters={chapters} dictionary={dictionary} />;
}
