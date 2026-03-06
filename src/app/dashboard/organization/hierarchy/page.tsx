
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
const LEVEL_COLORS = ["#FF3B3B", "#82C91E", "#3BC9DB", "#FFA94D"];

const ModernDeptCard = ({ node, level }: { node: DeptNode, level: number }) => {
  const brandColor = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

  return (
    <div
      className="dept-card" // ADD THIS CLASS
      style={{
        width: "350px", // Keep the larger card size
        backgroundColor: brandColor,
        // 1. Keep the card itself rounded for a premium feel
        borderRadius: "20px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        color: "white",
        position: "relative",
        transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
        zIndex: 2
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* 2. Update Image Section to remove rounding and add a border-radius only for the card itself */}
      <div style={{
        // 3. New Rectangular Size to match the shape better (portrait is popular)
        width: "80px",
        height: "100px", // Slightly taller portrait frame
        // 4. Removed rounded frame logic, just a clean box
        borderRadius: "12px", // Give the frame slightly softened corners to match the card
        border: "3px solid rgba(255,255,255,0.4)", // A visible, clean white frame
        overflow: "hidden",
        backgroundColor: "white",
        flexShrink: 0,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <img
          src={node.image || `https://ui-avatars.com/api/?name=${node.headName}&background=fff&color=${brandColor.replace('#', '')}&size=128`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt="profile"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${node.headName}&background=fff&color=${brandColor.replace('#', '')}&size=128`;
          }}
        />
      </div>

      {/* 3. Adjusted Info Section for a clean portrait look */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "3px", overflow: "hidden" }}>
        <h3 style={{
          fontSize: "17px",
          fontWeight: 900,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {node.headName}
        </h3>
        <p style={{
          fontSize: "12px",
          fontWeight: 600,
          opacity: 0.95,
          margin: 0,
          background: "rgba(0,0,0,0.1)",
          padding: "2px 8px",
          borderRadius: "6px",
          alignSelf: "start"
        }}>
          {node.headRole}
        </p>
        <div style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "6px",
          fontSize: "10px",
          opacity: 0.8,
          gap: "2px"
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📞 0123-546-346</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✉️ {node.headName.toLowerCase()}@company.com</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Tree Component ---
export default function CompanyStructure() {
  const [tree, setTree] = useState<DeptNode | null>(null);

  // --- PANNING STATE ---
  const [isDragging, setIsDragging] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // --- MOUSE HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // We want to drag if clicking the background OR the lines, but NOT the cards
    const isCard = (e.target as HTMLElement).closest('.dept-card');
    if (!isCard) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    // Calculate how much the mouse moved since the last frame
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    // Update the translate position
    setTranslate(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    // Save the current mouse position for the next frame
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  const renderTree = (node: DeptNode, level = 0) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Pass level to the card for coloring */}
      <ModernDeptCard node={node} level={level} />

      {node.subDepartments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

          {/* Vertical line DOWN */}
          <div style={{ width: "2px", height: "50px", backgroundColor: "#ADB5BD" }} />

          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {node.subDepartments.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.subDepartments.length - 1;

              return (
                <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", flex: 1 }}>

                  {/* Horizontal Bar */}
                  {node.subDepartments.length > 1 && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: isFirst ? "50%" : 0,
                      right: isLast ? "50%" : 0,
                      borderTop: "2px solid #ADB5BD"
                    }} />
                  )}

                  {/* Vertical line UP to meet horizontal bar */}
                  <div style={{ width: "2px", height: "50px", backgroundColor: "#ADB5BD" }} />

                  <div style={{ padding: "0 40px" }}>
                    {/* Recurse with level + 1 */}
                    {renderTree(child, level + 1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (!tree) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Building Structure...</div>;

  return (
    <div
      style={{
        backgroundColor: "#F8FAFC", // Light professional grey
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        position: "relative",
        // Adding a subtle grid background so you can see the movement
        backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* THE DRAGGABLE CANVAS */}
      <div style={{
        position: "absolute",
        // Use transform for high-performance movement
        transform: `translate(${translate.x}px, ${translate.y}px)`,
        // We use 'will-change' to tell the browser to use GPU acceleration
        willChange: "transform",
        padding: "200px", // Extra padding so you can't easily drag the tree off-screen
        display: "inline-block",
        minWidth: "max-content",
      }}>
        {/* Pass a class to the card so the drag logic knows to ignore it */}
        <div className="tree-container" style={{ display: "flex", justifyContent: "center" }}>
          {renderTree(tree, 0)}
        </div>
      </div>
    </div>
  );
}