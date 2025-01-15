"use client";

import { Input } from "@/components/ui/input";

import { useEffect, useRef, useState } from "react";
import styles from "./search.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    ArrowRight,
    FileDashed,
    FileMagnifyingGlass,
    GithubLogo,
    Lightbulb,
    LinkSimple,
    MagnifyingGlass,
    NoteBlank,
    NotionLogo,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getIconFromFilename } from "../common/iconUtils";
import { useIsMobileWidth } from "../common/utils";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/appSidebar/appSidebar";
import { Separator } from "@/components/ui/separator";
import { KhojLogoType } from "../components/logo/khojLogo";

interface AdditionalData {
    file: string;
    source: string;
    compiled: string;
    heading: string;
}

interface SearchResult {
    type: string;
    additional: AdditionalData;
    entry: string;
    score: number;
    "corpus-id": string;
}

function getNoteTypeIcon(source: string) {
    if (source === "notion") {
        return <NotionLogo className="text-muted-foreground" />;
    }
    if (source === "github") {
        return <GithubLogo className="text-muted-foreground" />;
    }
    return <NoteBlank className="text-muted-foreground" />;
}

const naturalLanguageSearchQueryExamples = [
    "What does the paper say about climate change?",
    "Making a cappuccino at home",
    "Benefits of eating mangoes",
    "How to plan a wedding on a budget",
    "Appointment with Dr. Makinde on 12th August",
    "Class notes lecture 3 on quantum mechanics",
    "Painting concepts for acrylics",
    "Abstract from the paper attention is all you need",
    "Climbing Everest without oxygen",
    "Solving a rubik's cube in 30 seconds",
    "Facts about the planet Mars",
    "How to make a website using React",
    "Fish at the bottom of the ocean",
    "Fish farming Kenya 2021",
    "How to make a cake without an oven",
    "Installing a solar panel at home",
];

interface NoteResultProps {
    note: SearchResult;
    setFocusSearchResult: (note: SearchResult) => void;
}

function Note(props: NoteResultProps) {
    const note = props.note;
    const isFileNameURL = (note.additional.file || "").startsWith("http");
    const fileName = isFileNameURL
        ? note.additional.heading
        : note.additional.file.split("/").pop();
    const fileIcon = getIconFromFilename(fileName || ".txt", "h-4 w-4 inline mr-2");

    return (
        <Card className="bg-secondary h-full shadow-sm rounded-lg border border-muted mb-4">
            <CardHeader>
                <CardTitle className="inline-flex gap-2">
                    {getNoteTypeIcon(note.additional.source)}
                    {fileName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="line-clamp-4 text-muted-foreground">{note.entry}</div>
                <Button
                    onClick={() => props.setFocusSearchResult(note)}
                    variant={"ghost"}
                    className="p-0 mt-2 text-orange-400 hover:bg-inherit"
                >
                    See content
                    <ArrowRight className="inline ml-2" />
                </Button>
            </CardContent>
            <CardFooter>
                {isFileNameURL ? (
                    <a
                        href={note.additional.file}
                        target="_blank"
                        className="underline text-sm bg-muted p-1 rounded-lg text-muted-foreground"
                    >
                        <LinkSimple className="inline m-2" />
                        {note.additional.file}
                    </a>
                ) : (
                    <div className="bg-muted p-2 text-sm rounded-lg text-muted-foreground">
                        {fileIcon}
                        {note.additional.file}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

function focusNote(note: SearchResult) {
    const isFileNameURL = (note.additional.file || "").startsWith("http");
    const fileName = isFileNameURL
        ? note.additional.heading
        : note.additional.file.split("/").pop();
    const fileIcon = getIconFromFilename(fileName || ".txt", "h-4 w-4 inline mr-2");

    return (
        <Card className="bg-secondary h-full shadow-sm rounded-lg bg-gradient-to-b from-background to-slate-50 dark:to-gray-950 border border-muted mb-4">
            <CardHeader>
                <CardTitle>{fileName}</CardTitle>
            </CardHeader>
            <CardFooter>
                {isFileNameURL ? (
                    <a
                        href={note.additional.file}
                        target="_blank"
                        className="underline text-sm bg-muted p-3 rounded-lg text-muted-foreground flex items-center gap-2"
                    >
                        <LinkSimple className="inline" />
                        {note.additional.file}
                    </a>
                ) : (
                    <div className="bg-muted p-3 text-sm rounded-lg text-muted-foreground flex items-center gap-2">
                        {fileIcon}
                        {note.additional.file}
                    </div>
                )}
            </CardFooter>
            <CardContent>
                <div className="text-m">{note.entry}</div>
            </CardContent>
        </Card>
    );
}

export default function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [searchResultsLoading, setSearchResultsLoading] = useState(false);
    const [focusSearchResult, setFocusSearchResult] = useState<SearchResult | null>(null);
    const [exampleQuery, setExampleQuery] = useState("");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isMobileWidth = useIsMobileWidth();

    useEffect(() => {
        setExampleQuery(
            naturalLanguageSearchQueryExamples[
                Math.floor(Math.random() * naturalLanguageSearchQueryExamples.length)
            ],
        );
    }, []);

    function search() {
        if (searchResultsLoading || !searchQuery.trim()) return;

        const apiUrl = `/api/search?q=${encodeURIComponent(searchQuery)}&client=web`;
        fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setSearchResults(data);
                setSearchResultsLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    useEffect(() => {
        if (!searchQuery.trim()) {
            return;
        }

        setFocusSearchResult(null);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                search();
            }, 750); // 1000 milliseconds = 1 second
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    return (
        <SidebarProvider>
            <AppSidebar conversationId={""} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {isMobileWidth ? (
                        <a className="p-0 no-underline" href="/">
                            <KhojLogoType className="h-auto w-16" />
                        </a>
                    ) : (
                        <h2 className="text-lg">Search</h2>
                    )}
                </header>
                <div>
                    <div className={`${styles.searchLayout}`}>
                        <div className="md:w-3/4 sm:w-full mx-auto pt-6 md:pt-8">
                            <div className="p-4 md:w-3/4 sm:w-full mx-auto">
                                <div className="flex justify-between items-center border-2 border-muted p-1 gap-1 rounded-lg">
                                    <Input
                                        autoFocus={true}
                                        className="border-none pl-4"
                                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === "Enter" && search()}
                                        type="search"
                                        placeholder="Search Documents"
                                    />
                                    <button
                                        className="px-2 gap-2 inline-flex items-center rounded border-l border-gray-300 hover:text-gray-500"
                                        onClick={() => search()}
                                    >
                                        <MagnifyingGlass className="h-4 w-4" />
                                        <span>Find</span>
                                    </button>
                                </div>
                                {focusSearchResult && (
                                    <div className="mt-4">
                                        <Button
                                            onClick={() => setFocusSearchResult(null)}
                                            className="mb-4"
                                            variant={"outline"}
                                        >
                                            <ArrowLeft className="inline mr-2" />
                                            Back
                                        </Button>
                                        {focusNote(focusSearchResult)}
                                    </div>
                                )}
                                {!focusSearchResult &&
                                    searchResults &&
                                    searchResults.length > 0 && (
                                        <div className="mt-4 max-w-[92vw] break-all">
                                            <ScrollArea className="h-[80vh]">
                                                {searchResults.map((result, index) => {
                                                    return (
                                                        <Note
                                                            key={result["corpus-id"]}
                                                            note={result}
                                                            setFocusSearchResult={
                                                                setFocusSearchResult
                                                            }
                                                        />
                                                    );
                                                })}
                                            </ScrollArea>
                                        </div>
                                    )}
                                {searchResults == null && (
                                    <Card className="flex flex-col items-center justify-center border-none shadow-none">
                                        <CardHeader className="flex flex-col items-center justify-center">
                                            <CardDescription className="border-muted-foreground border w-fit rounded-lg mb-2 text-center text-lg p-4">
                                                <FileMagnifyingGlass
                                                    weight="fill"
                                                    className="text-muted-foreground h-10 w-10"
                                                />
                                            </CardDescription>
                                            <CardTitle className="text-center">
                                                Search across your documents
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-muted-foreground items-center justify-center text-center flex">
                                            <Lightbulb className="inline mr-2" /> {exampleQuery}
                                        </CardContent>
                                    </Card>
                                )}
                                {searchResults && searchResults.length === 0 && (
                                    <Card className="flex flex-col items-center justify-center border-none shadow-none">
                                        <CardHeader className="flex flex-col items-center justify-center">
                                            <CardDescription className="border-muted-foreground border w-fit rounded-lg mb-2 text-center text-lg p-4">
                                                <FileDashed
                                                    weight="fill"
                                                    className="text-muted-foreground h-10 w-10"
                                                />
                                            </CardDescription>
                                            <CardTitle className="text-center">
                                                No documents found
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-muted-foreground items-center justify-center text-center flex">
                                                To use search, upload your docs to your account.
                                            </div>
                                            <Link
                                                href="https://docs.khoj.dev/data-sources/share_your_data"
                                                className="no-underline"
                                            >
                                                <div className="mt-4 text-center text-secondary-foreground bg-secondary w-fit m-auto p-2 rounded-lg">
                                                    Learn More
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
