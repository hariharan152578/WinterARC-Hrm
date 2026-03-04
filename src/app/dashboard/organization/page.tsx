"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface UserNode {
  id: number;
  name: string;
  role: string;
  position?: string;
  department?: string;
  children: UserNode[];
}

export default function OrganizationPage() {
  const [tree, setTree] = useState<UserNode | null>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    const res = await api.get("/users/hierarchy-tree");
    setTree(res.data);
  };

  const renderNode = (node: UserNode) => {
    return (
      <div className="flex flex-col items-center">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-4 w-52 text-center border">
          <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-3" />
          <h3 className="font-bold">{node.name}</h3>
          <p className="text-sm text-gray-500">{node.role}</p>
          <p className="text-xs text-gray-400">{node.department}</p>
        </div>

        {/* Children */}
        {node.children.length > 0 && (
          <div className="flex gap-10 mt-8">
            {node.children.map((child) => (
              <div key={child.id}>{renderNode(child)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!tree) return <div>Loading...</div>;

  return (
    <div className="p-10 overflow-auto">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Organization Structure
      </h1>

      <div className="flex justify-center">
        {renderNode(tree)}
      </div>
    </div>
  );
}