// "use client";

// import React, { useEffect, useState } from "react";
// import { getHierarchyUsers } from "@/services/user.service";

// // --- Types ---
// interface Member {
//   id: string;
//   name: string;
//   role: string;
//   bio: string;
//   image: string;
// }

// interface TeamLeadNode extends Member {
//   reports: Member[];
// }

// interface LeadNode extends Member {
//   reports: TeamLeadNode[];
// }

// interface HeadNode extends Member {}

// // --- Theme & Colors ---
// const COLORS = {
//   bg: "#EBE3D5",
//   primary: "#7A402D",   // Admin
//   secondary: "#B07E64", // Manager/TeamLead
//   tertiary: "#D1A384",  // Employee
//   line: "#A39281",
//   text: "#2D2D2D",
//   bio: "#666666",
// };

// const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// // --- Avatar Component ---
// const Avatar = ({ src, size, ringColor, isSmall = false }: { src: string; size: number; ringColor: string; isSmall?: boolean }) => (
//   <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
//     <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid rgba(163,146,129,0.3)`, zIndex: 0 }} />
//     <div style={{
//         position: "absolute", inset: -8, borderRadius: "50%", border: `${isSmall ? '3px' : '5px'} solid ${ringColor}`,
//         borderBottomColor: "transparent", borderLeftColor: "transparent", transform: isSmall ? "rotate(30deg)" : "rotate(-120deg)", zIndex: 1,
//       }}
//     />
//     <div style={{
//         width: "100%", height: "100%", borderRadius: "50%", border: "3px solid white", overflow: "hidden",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.1)", position: "relative", zIndex: 2, backgroundColor: "white",
//       }}
//     >
//       <img src={src || DEFAULT_AVATAR} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//     </div>
//   </div>
// );

// // --- Node Content Component ---
// const NodeContent = ({ name, role, bio, align = "center", color = COLORS.primary, isHead = false }: any) => (
//   <div style={{ textAlign: align, maxWidth: align === "center" ? (isHead ? "240px" : "180px") : "200px", marginTop: align === "center" ? "12px" : "0" }}>
//     <h3 style={{ margin: "0 0 2px", fontSize: isHead ? "1.2rem" : "0.95rem", fontWeight: 900, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
//       {name}
//     </h3>
//     <div style={{ backgroundColor: color, color: "white", padding: "2px 10px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800, display: "inline-block", marginBottom: "5px", textTransform: "uppercase" }}>
//       {role}
//     </div>
//     <p style={{ margin: 0, fontSize: "0.7rem", color: COLORS.bio, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
//       {bio}
//     </p>
//   </div>
// );

// // --- MAIN COMPONENT ---
// const OrgChart = () => {
//   const [head, setHead] = useState<HeadNode | null>(null);
//   const [leads, setLeads] = useState<LeadNode[]>([]);

//   useEffect(() => { loadHierarchy(); }, []);

//   const loadHierarchy = async () => {
//     try {
//       const res = await getHierarchyUsers();
//       const users = res.data;
//       const admin = users.find((u: any) => u.role === "ADMIN");
//       if (!admin) return;

//       const managers = users.filter((u: any) => u.role === "MANAGER" && u.createdBy === admin.id);
//       const leadsFormatted: LeadNode[] = managers.map((manager: any) => {
//         const teamLeads = users.filter((u: any) => u.role === "TEAMLEAD" && u.createdBy === manager.id);
//         const teamLeadNodes: TeamLeadNode[] = teamLeads.map((tl: any) => {
//           const employees: Member[] = users
//             .filter((u: any) => u.role === "EMPLOYEE" && u.createdBy === tl.id)
//             .map((emp: any) => ({
//               id: emp.id, name: emp.name, role: emp.role, bio: emp.description,
//               image: emp.profileImage ? `http://localhost:5000/${emp.profileImage}` : "",
//             }));
//           return {
//             id: tl.id, name: tl.name, role: tl.role, bio: tl.description,
//             image: tl.profileImage ? `http://localhost:5000/${tl.profileImage}` : "",
//             reports: employees,
//           };
//         });
//         return {
//           id: manager.id, name: manager.name, role: manager.role, bio: manager.description,
//           image: manager.profileImage ? `http://localhost:5000/${manager.profileImage}` : "",
//           reports: teamLeadNodes,
//         };
//       });

//       setHead({
//         id: admin.id, name: admin.name, role: admin.role, bio: admin.description,
//         image: admin.profileImage ? `http://localhost:5000/${admin.profileImage}` : "",
//       });
//       setLeads(leadsFormatted);
//     } catch (err) { console.error("Failed to load hierarchy", err); }
//   };

//   if (!head) return <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh' }} />;

//   return (
//     <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh", padding: "100px 40px", display: "flex", justifyContent: "flex-start", alignItems: "center", fontFamily: '"Inter", sans-serif', overflowX: 'auto' }}>
//       <div style={{ display: "flex", alignItems: "center", position: "relative", margin: "0 auto" }}>
        
//         {/* LEVEL 1: ADMIN */}
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, marginRight: "80px" }}>
//           <Avatar src={head.image} size={170} ringColor={COLORS.primary} />
//           <NodeContent name={head.name} role={head.role} bio={head.bio} isHead />
//           {/* Connector to Managers Trunk */}
//           <div style={{ position: "absolute", right: "-80px", top: "85px", width: "80px", height: "2px", backgroundColor: COLORS.line }} />
//         </div>

//         {/* LEVEL 2: MANAGERS */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "100px", position: "relative", borderLeft: `2px solid ${COLORS.line}`, paddingLeft: "60px" }}>
          
//           {leads.map((manager) => (
//             <div key={manager.id} style={{ display: "flex", alignItems: "center", position: "relative" }}>
//               {/* Horizontal line from Trunk to Manager */}
//               <div style={{ position: "absolute", left: "-60px", top: "67px", width: "60px", height: "2px", backgroundColor: COLORS.line }} />

//               <div style={{ display: "flex", alignItems: "center", gap: "60px" }}>
//                 {/* Manager Card */}
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "180px" }}>
//                   <Avatar src={manager.image} size={135} ringColor={COLORS.secondary} />
//                   <NodeContent name={manager.name} role={manager.role} bio={manager.bio} color={COLORS.secondary} />
//                 </div>

//                 {/* LEVEL 3: TEAM LEADS Trunk */}
//                 <div style={{ display: "flex", flexDirection: "column", gap: "60px", borderLeft: `2px solid ${COLORS.line}`, paddingLeft: "40px", position: "relative" }}>
                  
//                   {manager.reports.map((tl) => (
//                     <div key={tl.id} style={{ display: "flex", alignItems: "center", position: "relative" }}>
//                       {/* Line from TL Trunk to TL */}
//                       <div style={{ position: "absolute", left: "-40px", top: "47px", width: "40px", height: "2px", backgroundColor: COLORS.line }} />
                      
//                       <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
//                         {/* Team Lead Card */}
//                         <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "260px" }}>
//                           <Avatar src={tl.image} size={95} ringColor={COLORS.secondary} isSmall />
//                           <NodeContent name={tl.name} role={tl.role} bio={tl.bio} align="left" color={COLORS.secondary} />
//                         </div>

//                         {/* LEVEL 4: EMPLOYEES Trunk */}
//                         {tl.reports.length > 0 && (
//                           <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderLeft: `2px solid ${COLORS.line}`, paddingLeft: "30px", position: "relative" }}>
//                             {tl.reports.map((emp) => (
//                               <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}>
//                                 {/* Line from Emp Trunk to Emp */}
//                                 <div style={{ position: "absolute", left: "-30px", top: "35px", width: "30px", height: "2px", backgroundColor: COLORS.line }} />
//                                 <Avatar src={emp.image} size={70} ringColor={COLORS.tertiary} isSmall />
//                                 <NodeContent name={emp.name} role={emp.role} bio={emp.bio} align="left" color={COLORS.tertiary} />
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default OrgChart;

"use client";

import React, { useEffect, useState } from "react";
import { getHierarchyUsers } from "@/services/user.service";

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  role: string;
  createdBy: string | null;
  department?: string;
  profileImage?: string;
}

interface DeptNode {
  id: string;
  name: string;
  headName: string;
  headRole: string;
  employeeCount: number;
  image: string;
  subDepartments: DeptNode[];
  isYourDepartment: boolean;
  isOnPathToYou: boolean;
}

// --- Design Tokens ---
const THEME = {
  bg: "#F0F5FA",
  accent: "#00BAFF", // Your "Company Structure" blue
  line: "#D1D5DB",
  cardBg: "#FFFFFF",
  textHeading: "#1A202C",
  textSub: "#718096",
  shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
};

// --- Modern Card Component ---
const ModernDeptCard = ({ node }: { node: DeptNode }) => {
  return (
    <div style={{
      width: "260px",
      backgroundColor: THEME.cardBg,
      borderRadius: "16px",
      border: node.isYourDepartment ? `2px solid ${THEME.accent}` : "1px solid transparent",
      boxShadow: THEME.shadow,
      transition: "transform 0.2s ease, border-color 0.2s ease",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      zIndex: 2,
    }}>
      {node.isYourDepartment && (
        <div style={{
          position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: THEME.accent, color: "white", padding: "2px 14px",
          borderRadius: "20px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px"
        }}>
          YOUR DEPARTMENT
        </div>
      )}

      <div style={{ padding: "16px" }}>
        {/* Header Area */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: THEME.textHeading, textTransform: "uppercase" }}>
            {node.name}
          </span>
          <div style={{ width: "16px", height: "16px", opacity: 0.4 }}>🔍</div>
        </div>

        {/* Profile Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ position: "relative" }}>
            <img 
              src={node.image || `https://ui-avatars.com/api/?name=${node.headName}&background=random`} 
              alt="avatar" 
              style={{ width: "40px", height: "40px", borderRadius: "12px", objectFit: "cover" }}
            />
            {node.isOnPathToYou && (
              <div style={{ position: "absolute", bottom: -2, right: -2, width: "10px", height: "10px", borderRadius: "50%", border: "2px solid white", backgroundColor: THEME.accent }} />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: THEME.textHeading }}>{node.headName}</span>
            <span style={{ fontSize: "10px", fontWeight: 500, color: THEME.textSub, textTransform: "uppercase" }}>{node.headRole}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #EDF2F7", paddingTop: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "9px", color: THEME.textSub }}>Employees</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: THEME.textHeading }}>{node.employeeCount}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #EDF2F7", paddingLeft: "12px" }}>
            <span style={{ fontSize: "9px", color: THEME.textSub }}>Sub-units</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: THEME.textHeading }}>{node.subDepartments.length}</span>
          </div>
        </div>
      </div>

      {/* Modern Footer Button */}
      {node.subDepartments.length > 0 && (
        <div style={{
          background: "rgba(247, 250, 252, 0.8)",
          backdropFilter: "blur(4px)",
          padding: "8px",
          textAlign: "center",
          fontSize: "11px",
          fontWeight: 700,
          color: THEME.textSub,
          borderTop: "1px solid #EDF2F7",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          cursor: "pointer"
        }}>
          {node.subDepartments.length} Departments ▾
        </div>
      )}
    </div>
  );
};

// --- Main Tree Component ---
export default function CompanyStructure() {
  const [tree, setTree] = useState<DeptNode | null>(null);
  
  // Replace this with your actual logged-in user ID
  const myUserId = "user-abc-123"; 

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getHierarchyUsers();
        const users: User[] = res.data;
        const root = users.find(u => u.role === "ADMIN") || users[0];
        if (root) setTree(transformData(root, users, myUserId));
      } catch (err) { console.error(err); }
    };
    loadData();
  }, []);

  const transformData = (curr: User, all: User[], targetId: string): DeptNode => {
    const children = all.filter(u => u.createdBy === curr.id);
    const subNodes = children.map(c => transformData(c, all, targetId));
    
    const isMe = curr.id === targetId;
    const leadsToMe = subNodes.some(n => n.isYourDepartment || n.isOnPathToYou);

    return {
      id: curr.id,
      name: curr.department || "Organization Unit",
      headName: curr.name,
      headRole: curr.role,
      employeeCount: children.length,
      image: curr.profileImage ? `http://localhost:5000/${curr.profileImage}` : "",
      subDepartments: subNodes,
      isYourDepartment: isMe,
      isOnPathToYou: leadsToMe,
    };
  };

  const renderTree = (node: DeptNode, isRoot = false) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <ModernDeptCard node={node} />
      
      {node.subDepartments.length > 0 && (
        <div style={{ display: "flex", paddingTop: "40px", position: "relative" }}>
          {/* Vertical path line from parent */}
          <div style={{
            position: "absolute", top: 0, left: "50%", width: "2px", height: "40px",
            backgroundColor: node.isOnPathToYou || node.isYourDepartment ? THEME.accent : THEME.line
          }} />

          {/* Sibling horizontal connector bar */}
          <div style={{
            position: "absolute", top: "40px", left: "25%", right: "25%", height: "2px",
            backgroundColor: THEME.line
          }} />

          {node.subDepartments.map((child, idx) => (
            <div key={child.id} style={{ padding: "0 20px", position: "relative" }}>
              {/* Vertical line from connector to child */}
              <div style={{
                position: "absolute", top: 0, left: "50%", width: "2px", height: "40px",
                backgroundColor: child.isOnPathToYou || child.isYourDepartment ? THEME.accent : THEME.line
              }} />
              {renderTree(child)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!tree) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Building Structure...</div>;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: "100vh", padding: "100px 40px", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "center", minWidth: "max-content" }}>
        {renderTree(tree, true)}
      </div>
    </div>
  );
}