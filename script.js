import React, { useState } from 'react';
import { Upload, ClipboardList, User, ShieldAlert, CheckCircle, Trophy } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [view, setView] = useState('recruiter'); // recruiter, test, results
  const [loading, setLoading] = useState(false);
  
  // State for JD Generation
  const [jd, setJd] = useState({ title: '', raw_text: '' });
  const [assessment, setAssessment] = useState(null);

  // State for Candidate Submission
  const [candidate, setCandidate] = useState({ id: '', resume: '', answers: [] });
  const [report, setReport] = useState(null);

  // --- API HANDLERS ---
  const generateAssessment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate-assessment`, jd);
      setAssessment(res.data);
      // Initialize empty answers based on question count
      setCandidate({ ...candidate, answers: res.data.questions.map(() => ({ answer: "" })) });
      alert("Assessment Generated Successfully!");
    } catch (err) { alert("Error generating assessment"); }
    setLoading(false);
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const payload = {
        candidate_id: candidate.id,
        resume_text: candidate.resume,
        answers: candidate.answers
      };
      const res = await axios.post(`${API_BASE}/submit/${assessment.assessment_id}`, payload);
      setReport(res.data);
      setView('results');
    } catch (err) { alert("Error submitting test"); }
    setLoading(false);
  };

  // --- UI COMPONENTS ---

  const Header = () => (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2 font-bold text-xl">
        <ShieldAlert className="text-blue-400" /> AI-Assess
      </div>
      <div className="flex gap-4">
        <button onClick={() => setView('recruiter')} className="hover:text-blue-400">Recruiter Portal</button>
        <button onClick={() => setView('test')} disabled={!assessment} className="hover:text-blue-400 disabled:opacity-50">Live Test</button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto p-8">
        {/* RECRUITER VIEW: JD UPLOAD */}
        {view === 'recruiter' && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Upload size={24} /> Create New Assessment
            </h2>
            <div className="space-y-4">
              <input 
                className="w-full p-3 border rounded-lg" 
                placeholder="Job Title (e.g. Senior Python Developer)"
                onChange={(e) => setJd({...jd, title: e.target.value})}
              />
              <textarea 
                className="w-full p-3 border rounded-lg h-40" 
                placeholder="Paste Job Description here..."
                onChange={(e) => setJd({...jd, raw_text: e.target.value})}
              />
              <button 
                onClick={generateAssessment}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 w-full transition"
                disabled={loading}
              >
                {loading ? "AI is generating questions..." : "Generate AI Assessment"}
              </button>
            </div>

            {assessment && (
              <div className="mt-8 border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Generated Question Set ({assessment.questions.length})</h3>
                {assessment.questions.map((q, i) => (
                  <div key={i} className="mb-3 p-3 bg-slate-50 rounded border">
                    <span className="text-xs font-bold text-blue-600 uppercase">{q.type}</span>
                    <p className="font-medium">{q.question_text}</p>
                  </div>
                ))}
                <button onClick={() => setView('test')} className="mt-4 text-blue-600 font-bold underline">Go to Candidate Link →</button>
              </div>
            )}
          </div>
        )}

        {/* TEST VIEW: CANDIDATE INTERFACE */}
        {view === 'test' && assessment && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-2">Technical Assessment</h2>
            <p className="text-slate-500 mb-8 border-b pb-4 italic">Role: {jd.title}</p>
            
            <div className="mb-8 space-y-4">
               <label className="block font-bold">Candidate ID/Name</label>
               <input className="w-full p-2 border rounded" placeholder="John Doe" onChange={(e) => setCandidate({...candidate, id: e.target.value})} />
               <label className="block font-bold">Paste your Resume Text (for verification)</label>
               <textarea className="w-full p-2 border rounded h-24" onChange={(e) => setCandidate({...candidate, resume: e.target.value})} />
            </div>

            {assessment.questions.map((q, i) => (
              <div key={i} className="mb-8 p-6 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-lg mb-4">Q{i+1}: {q.question_text}</p>
                {q.type === 'MCQ' ? (
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => {
                          const newAns = [...candidate.answers];
                          newAns[i] = { answer: opt };
                          setCandidate({...candidate, answers: newAns});
                        }}
                        className={`p-3 text-left border rounded-lg ${candidate.answers[i]?.answer === opt ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    className="w-full p-3 border rounded-lg h-32" 
                    placeholder="Enter your answer or code logic..."
                    onChange={(e) => {
                      const newAns = [...candidate.answers];
                      newAns[i] = { answer: e.target.value };
                      setCandidate({...candidate, answers: newAns});
                    }}
                  />
                )}
              </div>
            ))}
            <button 
              onClick={submitTest}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Evaluating..." : "Submit Assessment"}
            </button>
          </div>
        )}

        {/* RESULTS VIEW: DASHBOARD */}
        {view === 'results' && report && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-green-500 text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-3xl font-bold">Assessment Complete</h2>
              <p className="text-slate-500">Candidate: {report.candidate_id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Anti-Fake Analysis */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-red-100">
                <h3 className="font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-red-500" /> ANTI-FRAUD ANALYSIS
                </h3>
                <div className="text-4xl font-black text-red-600">
                  {report.anti_fake_analysis.consistency_score}%
                </div>
                <p className="text-sm mt-2 text-slate-600">Consistency with Resume Claims</p>
                {report.anti_fake_analysis.is_fake && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">
                    ⚠️ Mismatch Flagged: High risk of unqualified application
                  </div>
                )}
              </div>

              {/* Overall Score */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
                <h3 className="font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <Trophy className="text-blue-500" /> OVERALL SKILL SCORE
                </h3>
                <div className="text-4xl font-black text-blue-600">
                  {report.total_score} pts
                </div>
                <p className="text-sm mt-2 text-slate-600">Across MCQ and AI-Evaluated Logic</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold mb-4">Section-wise Breakdown</h3>
              {report.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm truncate mr-4">{item.question}</span>
                  <span className="font-bold text-blue-600">{item.score}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setView('recruiter')}
              className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mx-auto"
            >
              ← Back to Recruiter Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}