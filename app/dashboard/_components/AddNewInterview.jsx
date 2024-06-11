// "use client";
// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { chatSession } from "@/utils/GeminiAIModel";
// import { LoaderCircle } from "lucide-react";
// import { db } from "@/utils/db";
// import { MockInterview } from "@/utils/schema";
// import { v4 as uuidv4 } from "uuid";
// import { useUser } from "@clerk/nextjs";
// import moment from "moment";
// import { useRouter } from "next/navigation";

// function AddNewInterview() {
//   const [openDailog, setOpenDailog] = useState(false);
//   const [jobPosition, setJobPosition] = useState();
//   const [jobDesc, setJobDesc] = useState();
//   const [jobExperience, setJobExperience] = useState();
//   const [loading, setLoading] = useState(false);
//   const [jsonResponse, setJsonResponse] = useState([]);
//   const { user } = useUser();
//   const router = useRouter();
//   const onSubmit = async (e) => {
//     setLoading(true);
//     e.preventDefault();
//     console.log(jobPosition, jobDesc, jobExperience);
//     const InputPrompt =
//       "Job Position :" +
//       jobPosition +
//       ", Job Description : " +
//       jobDesc +
//       " , years of Experience: " +
//       jobPosition +
//       ",depending upon the information provided give me " +
//       process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT +
//       " interview questions along with their answers in JSON format, Give question and answers as field in JSON";
//     const result = await chatSession.sendMessage(InputPrompt);
//     const MockJsonResp = result.response
//       .text()
//       .replace("```json", "")
//       .replace("```", "");
//     console.log(JSON.parse(MockJsonResp));
//     setJsonResponse(MockJsonResp);
//     if (MockJsonResp) {
//       const resp = await db
//         .insert(MockInterview)
//         .values({
//           mockId: uuidv4(),
//           jsonMockResp: MockJsonResp,
//           jobPosition: jobPosition,
//           jobDesc: jobDesc,
//           jobExperience: jobExperience,
//           createdBy: user?.primaryEmailAddress?.emailAddress,
//           createdAt: moment().format("DD-MM-yyyy"),
//         })
//         .returning({ mockId: MockInterview.mockId });
//       console.log("Inserted ID:", resp);
//       if (resp) {
//         setOpenDailog(false);
//         router.push("/dashboard/interview/" + resp[0]?.mockId);
//       }
//     } else {
//       console.log("ERROR");
//     }
//     setLoading(false);
//   };
//   return (
//     <div>
//       <div
//         className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
//         onClick={() => setOpenDailog(true)}
//       >
//         <h2 className="font-bold text-lg text-center">+ Add new</h2>
//       </div>
//       <Dialog open={openDailog}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="text-2xl">
//               Tell us more about your job Interview
//             </DialogTitle>
//             <DialogDescription>
//               <form onSubmit={onSubmit}>
//                 <div>
//                   <h2>
//                     Add Details about your job position/role, Job description
//                     and years of experience
//                   </h2>
//                   <div className="mt-7 my-3">
//                     <label>Job Role/Job Position</label>
//                     <Input
//                       placeholder="Ex. Full Stack Developer"
//                       required
//                       onChange={(event) => setJobPosition(event.target.value)}
//                     />
//                   </div>
//                   <div className="my-3">
//                     <label>Job Description/ Tech Stack(in Short)</label>
//                     <Textarea
//                       placeholder="Ex. React, Angular, NodeJs, MySql etc"
//                       required
//                       onChange={(event) => setJobDesc(event.target.value)}
//                     />
//                   </div>
//                   <div className="my-3">
//                     <label>Years of Experience</label>
//                     <Input
//                       placeholder="Ex. 5"
//                       type="number"
//                       max="50"
//                       required
//                       onChange={(event) => setJobExperience(event.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex gap-5 justify-end">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     onClick={() => setOpenDailog(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={loading}>
//                     {loading ? (
//                       <>
//                         <LoaderCircle className="animate-spin" />
//                         'Generating from AI'
//                       </>
//                     ) : (
//                       "Start Interview"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default AddNewInterview;
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const [error, setError] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const extractJSON = (text) => {
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = text.substring(jsonStart, jsonEnd);
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    }
    return null;
  };

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt =
      `Job Position: ${jobPosition}, Job Description: ${jobDesc}, years of Experience: ${jobExperience}, ` +
      `depending upon the information provided give me ` +
      `${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions along with their answers in JSON format. ` +
      `Give question and answers as fields in JSON.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const responseText = await result.response.text();

      // Log the full response to understand its structure
      console.log("Full response:", responseText);

      // Extract the JSON part of the response
      const MockJsonResp = extractJSON(responseText);

      if (MockJsonResp) {
        console.log(MockJsonResp);

        const resp = await db
          .insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: JSON.stringify(MockJsonResp),
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("DD-MM-yyyy"),
          })
          .returning({ mockId: MockInterview.mockId });

        console.log("Inserted ID:", resp);
        if (resp) {
          setOpenDailog(false);
          router.push("/dashboard/interview/" + resp[0]?.mockId);
        }
      } else {
        setError("The response did not contain valid JSON. Please provide more specific details.");
        console.error("Error: JSON not found in the response");
      }
    } catch (error) {
      setError("An error occurred while processing your request. Please try again.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDailog(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add new</h2>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job Interview
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>
                    Add Details about your job position/role, Job description
                    and years of experience
                  </h2>
                  <div className="mt-7 my-3">
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech Stack(in Short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, MySql etc"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Years of Experience</label>
                    <Input
                      placeholder="Ex. 5"
                      type="number"
                      max="50"
                      required
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDailog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        'Generating from AI'
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
