"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TreePine, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { familyData } from "@/lib/family-data";
import FamilyTreeFlow from "@/components/family-tree-flow";

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return familyData;

    // Strict search - only match first name and last name
    return familyData.filter((member) => {
      const nameParts = member.name.toLowerCase().split(" ");
      const searchLower = searchTerm.toLowerCase();

      // Check if search term matches any part of the name
      return nameParts.some((namePart) => namePart.includes(searchLower));
    });
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <TreePine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Family Directory
                </h1>
                <p className="text-sm text-slate-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Full height tree container */}
      <div className="h-[calc(100vh-64px)]">
        <FamilyTreeFlow
          members={filteredMembers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {filteredMembers.length === 0 && searchTerm && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No family members found
            </h3>
            <p className="text-slate-600">Try adjusting your search terms</p>
          </div>
        </div>
      )}
    </div>
  );
}
