
import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

// Controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    console.log("userContent:", userContent);

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. And only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });

  } catch (error) {
    console.log("AI Error:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

// Controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. And only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });

  } catch (error) {
    console.log("Job Desc Error:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

// Controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const systemPrompt = "You are an expert AI Agent to extract data from resume. Return only valid JSON, no extra text.";

    const userPrompt = `Extract data from this resume: ${resumeText}
    
    Provide data in the following JSON format with no additional text before or after:

    {
        "professional_summary": "",
        "skills": [],
        "personal_info": {
            "image": "",
            "full_name": "",
            "profession": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "website": ""
        },
        "experience": [],
        "project": [],
        "education": []
    }`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const extractedData = response.choices[0].message.content;
    console.log("Extracted Data:", extractedData);
    
    const cleanData = extractedData.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanData);

    const newResume = await Resume.create({ userId, title, ...parsedData });

    res.json({ resumeId: newResume._id });

  } catch (error) {
    console.log("Upload Error:", error.message);
    return res.status(400).json({ message: error.message });
  }
};