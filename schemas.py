from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class JobDescription(BaseModel):
    title: str
    raw_text: str

class SkillRequirement(BaseModel):
    skill: str
    importance: int # 1-10
    level: str # Junior, Mid, Senior

class Question(BaseModel):
    type: str # MCQ, SUBJECTIVE, CODING
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    difficulty: str
    weightage: int

class Assessment(BaseModel):
    job_id: str
    questions: List[Question]

class CandidateSubmission(BaseModel):
    candidate_id: str
    resume_text: str
    answers: List[Dict[str, str]] # {"question_id": "answer"}