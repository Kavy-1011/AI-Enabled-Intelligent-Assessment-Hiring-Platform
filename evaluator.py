import json
import logging
from openai import OpenAI
from pydantic import ValidationError

# Initialize logging to see what's happening
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(_name_)

# Ensure your API key is correctly set in your environment
client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

class Evaluator:
    @staticmethod
    def _call_openai(prompt: str):
        """Helper to handle API calls with error logging."""
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI API Error: {e}")
            # Fallback structure if API fails
            return {"score": 0, "reason": "System error during evaluation", "error": str(e)}

    @staticmethod
    def evaluate_subjective(question: str, user_answer: str, criteria: str):
        prompt = f"""
        Evaluate this answer based on the criteria.
        Question: {question}
        User Answer: {user_answer}
        Expected Logic: {criteria}
        
        Return a JSON object strictly in this format:
        {{"score": <int 0-10>, "reason": "<string>"}}
        """
        return Evaluator._call_openai(prompt)

    @staticmethod
    def detect_mismatch(resume_text: str, test_performance: str):
        prompt = f"""
        Compare the candidate's Resume claims with their Test Performance.
        Resume: {resume_text}
        Results: {test_performance}
        
        Does the performance justify the resume claims? 
        Return a JSON object strictly in this format:
        {{"consistency_score": <int 0-100>, "is_fake": <boolean>, "flag": "<string>"}}
        """
        return Evaluator._call_openai(prompt)
