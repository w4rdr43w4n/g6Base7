import { FC, useState, useEffect } from "react";
import "../styles/srch_components.css";
import { Import } from "@/app/api/search_utils/literature_utils";
import { useSession } from "next-auth/react";

interface props {
  onExit: (e: boolean) => void;
  onSend: (e: string) => void;
  type: string;
}

const ImportPopup: FC<props> = ({ onExit, onSend, type }) => {

  const [collectedItems, setCollectedItems] = useState<any>([]);
  function handleExitBtn(e: any) {
    onExit(false);
  }
  useEffect(() => {
    const Fetch = async () => {
      const resp = await Import(type);
      console.log(resp.data.imports);
      setCollectedItems(resp.data.imports);
    };
    Fetch();
  }, []);
  function handleSelect(title: string) {
    const selected: any = collectedItems.filter(
      (item: any) => item.title === title
    );
    onSend(selected[0].content);
    onExit(false);
  }
  function handleSelectRef(list: string) {
    const selected: any = collectedItems.filter(
      (item: any) => item.list === list
    );
    onSend(selected[0].list);
    onExit(false);
  }
  return (
    <section className="custom-lr">
      <section className="imp">
        <h1>Saved works</h1>
        <div>
          {collectedItems.map((e: any, i: number) => (
            <>
              {e.title && e.content ? (
                <button onClick={() => handleSelect(e.title || e.list)} key={i}>
                  <>
                    <p>Title:{e.title || "Ref"}</p>{" "}
                    <p className="content">Content:{e.content || e.list}</p>{" "}
                  </>
                </button>
              ) : (
                <button onClick={() => handleSelectRef(e.list)} key={i}>
                  <p className="content">{e.list}</p>
                </button>
              )}
            </>
          ))}
        </div>
        <button onClick={handleExitBtn} className="exit-lr-btn">
          EXIT
        </button>
      </section>
    </section>
  );
};

export default ImportPopup;
