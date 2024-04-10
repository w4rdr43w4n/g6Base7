"use client";
import { FC, useState } from "react";
import SearchButton from "@/components/Search/SearchButton";
import SearchDataFetch from "@/components/Search/SearchDataFetch";
import SearchBar from "@/components/Search/SearchBar";
import PlagiarismChecker from "@/components/Search/PlagiarismChecker";
import "@/app/styles/App.css";
import Container from "@/components/Search/Container";
import LiteratureReview from "@/components/Search/literature_review";
import LiteraturePopup from "@/components/Search/literature_popup";
import ReferencePopup from "@/components/Search/ReferencePopup";
import Article from "@/components/Search/article";
import ImportPopup from "@/components/Search/import_popup";
import { SessionProvider } from "next-auth/react";

const App: FC = () => {
  const [_searchRes, setSearchRes] = useState<unknown>(null);
  const [customLR, setCustomLR] = useState<boolean>(false);
  const [customRef, setCustomRef] = useState<boolean>(false);
  const [query, getQuery] = useState("");
  const [Searching, setSearchState] = useState<boolean>(false);
  const [engine, setEngine] = useState("semantic");
  const [popup, setShowPopup] = useState<boolean>(false);
  const [lrContent, setLrContent] = useState("");
  const [artContent, setArtContent] = useState("");
  const [reflst, setReflst] = useState("");

  const [type, setType] = useState("lr");

  // This function get the query from the search bar
  const handleSearchInputChange = (e: any) => {
    getQuery(e.target.value);
    setSearchState(false);
  };
  // This function set the Research results output
  const handleSearchButtonClick = (e: any) => {
    setEngine(e.target.value);
    getQuery(query);
    setSearchState(true);
  };
  const handleViewLiterature = () => {
    setCustomLR(true);
  };
  const handleViewRef = () => {
    setCustomRef(true);
  };
  function setText(value: string) {
    switch (type) {
      case "lr":
        setLrContent(value);
        break;
      case "art":
        setArtContent(value);
        break;
      case "out":
        setArtContent(value);
        break;
      case "ref":
        setReflst(value);
        break;
    }
  }
  return (
    <main>
      {popup && (
        <SessionProvider>
          <ImportPopup onExit={setShowPopup} type={type} onSend={setText} />
        </SessionProvider>
      )}
      <Container>
        <h1>Search tools</h1>
        <SearchBar value={query} onChange={handleSearchInputChange} />
        <div className="search-buttons">
          <SearchButton label="arxiv" onClick={handleSearchButtonClick} />
          <SearchButton label="archive" onClick={handleSearchButtonClick} />
          <SearchButton label="semantic" onClick={handleSearchButtonClick} />
        </div>
        <SearchDataFetch
          searchEngine={engine}
          isSearching={Searching}
          query={query}
          onFetch={setSearchRes}
        />
      </Container>

      <Container>
        <LiteratureReview
          value={lrContent}
          query={query}
          importType={setType}
          setOutput={setLrContent}
          isImport={setShowPopup}
        />
      </Container>
      <Container>
        <Article
          value={artContent}
          query={query}
          importType={setType}
          setOutput={setArtContent}
          isImport={setShowPopup}
        />
      </Container>
      <Container>
        <PlagiarismChecker />
        <button className="view-custom-lr-btn" onClick={handleViewLiterature}>
          Create Custom Literature Review
        </button>
        <button className="view-custom-lr-btn" onClick={handleViewRef}>
          Create Custom references list
        </button>
        {customLR && <LiteraturePopup onExit={setCustomLR} />}
        {customRef && (
          <ReferencePopup
            value={reflst}
            setOutput={setReflst}
            importType={setType}
            isImport={setShowPopup}
            onExit={setCustomRef}
          />
        )}
      </Container>
    </main>
  );
};

export default App;
