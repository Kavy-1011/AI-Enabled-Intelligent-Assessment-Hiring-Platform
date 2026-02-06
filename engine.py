mport os
from openai import OpenAI
import json
from schemas import Question

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

class AIEngine:
    @staticmethod
    def parse_jd(jd_text: str):
        prompt = f"""
        Analyze the following Job Description and extract:
        1. Key Technical Skills
        2. Soft Skills
        3. Experience Level
        4. Primary Tools
        Format as JSON. 
        JD: {jd_text}
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)

    @staticmethod
    def generate_questions(skills_json: dict, count: int = 10):
        prompt = f"""
        Based on these requirements: {json.dumps(skills_json)}, 
        generate {count} assessment questions. 
        Include a mix of:
        - MCQs (Conceptual)
        - Subjective (Scenario-based)
        - Coding (Logic/Algorithms)
        Return a JSON list of objects matching the 'Question' schema.
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)['questions']