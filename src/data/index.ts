import problemsData from "./problems.json";
import gfeProblemsData from "./gfeproblems75.json";
import patternsData from "./patterns.json";
import interviewRoadmapData from "./interview-roadmap.json";
import dsaMindmapData from "./dsa-mindmap.json";
import {
  Problem,
  Pattern,
  RoadmapSection,
  DSAMindmap,
} from "../types";

export const problems = problemsData as Problem[];
export const gfeProblems = gfeProblemsData as Problem[];
export const patterns = patternsData as Pattern[];
export const interviewRoadmap = interviewRoadmapData as RoadmapSection[];
export const dsaMindmap = dsaMindmapData as DSAMindmap;
