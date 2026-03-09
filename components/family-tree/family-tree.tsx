"use client";

import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonData {
  label: string;
  role: string;
  age: string;
  gender: string;
  birthplace: string;
  residence: string;
}

interface CustomNodeProps {
  data: PersonData;
  nodeId: string;
  onAddNode: (parentId: string, data: PersonData) => void;
  onEditNode: (nodeId: string, data: PersonData) => void;
  onDeleteNode: (nodeId: string) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  nodeId,
  onAddNode,
  onEditNode,
  onDeleteNode,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] =
    useState<"add" | "edit" | "delete" | "view" | null>(null);

  const [formData, setFormData] = useState<PersonData>({
    label: "",
    role: "",
    age: "",
    gender: "",
    birthplace: "",
    residence: "",
  });

  const openDialogHandler = (type: any) => {
    setDialogType(type);

    if (type === "edit") {
      setFormData(data);
    } else {
      setFormData({
        label: "",
        role: "",
        age: "",
        gender: "",
        birthplace: "",
        residence: "",
      });
    }

    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (!dialogType) return;

    if (dialogType === "add") {
      onAddNode(nodeId, formData);
    }

    if (dialogType === "edit") {
      onEditNode(nodeId, formData);
    }

    if (dialogType === "delete") {
      onDeleteNode(nodeId);
    }

    setOpenDialog(false);
  };

  return (
    <>
      <div className="group relative w-52">
        <Card className="shadow-lg border rounded-xl relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button size="icon" variant="outline" onClick={() => openDialogHandler("add")}>+</Button>
            <Button size="icon" variant="outline" onClick={() => openDialogHandler("edit")}>✏️</Button>
            <Button size="icon" variant="outline" onClick={() => openDialogHandler("delete")}>🗑</Button>
            <Button size="icon" variant="outline" onClick={() => openDialogHandler("view")}>👁️</Button>
          </div>

          <CardContent className="p-3 flex flex-col items-center gap-1">
            <Avatar>
              <AvatarFallback>{data.label?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-sm">{data.label}</p>
              <p className="text-xs text-muted-foreground">{data.role}</p>
              {data.age && (
                <p className="text-xs text-muted-foreground">
                  Age: {data.age}
                </p>
              )}
            </div>
          </CardContent>



          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Bottom} />
        </Card>
      </div>

      {/* ================= Dialog ================= */}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "add" && `Add Child for ${data.label}`}
              {dialogType === "edit" && `Edit ${data.label}`}
              {dialogType === "delete" && `Delete ${data.label}?`}
              {dialogType === "view" && `View ${data.label}`}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {(dialogType === "add" || dialogType === "edit") && (
              <>
                <Field label="Name" value={formData.label}
                  onChange={(v) => setFormData({ ...formData, label: v })} />
                <Field label="Role" value={formData.role}
                  onChange={(v) => setFormData({ ...formData, role: v })} />
                <Field label="Age" value={formData.age}
                  onChange={(v) => setFormData({ ...formData, age: v })} />
                <Field label="Gender" value={formData.gender}
                  onChange={(v) => setFormData({ ...formData, gender: v })} />
                <Field label="Birthplace" value={formData.birthplace}
                  onChange={(v) => setFormData({ ...formData, birthplace: v })} />
                <Field label="Residence" value={formData.residence}
                  onChange={(v) => setFormData({ ...formData, residence: v })} />

                <DialogFooter>
                  <Button onClick={handleSubmit}>
                    {dialogType === "add" ? "Add" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </>
            )}

            {dialogType === "delete" && (
              <>
                <p>Are you sure you want to delete {data.label}?</p>
                <DialogFooter>
                  <Button onClick={handleSubmit}>Delete</Button>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </>
            )}

            {dialogType === "view" && (
              <div className="space-y-1">
                <p><strong>Name:</strong> {data.label}</p>
                <p><strong>Role:</strong> {data.role}</p>
                <p><strong>Age:</strong> {data.age}</p>
                <p><strong>Gender:</strong> {data.gender}</p>
                <p><strong>Birthplace:</strong> {data.birthplace}</p>
                <p><strong>Residence:</strong> {data.residence}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <Input
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
    />
  </div>
);


export default function FamilyTree() {
  const initialNodes: Node<PersonData>[] = [
    { id: "grandfather", position: { x: 300, y: 0 }, type: "custom", data: { label: "Rajesh Sharma", role: "Grandfather", age: "78", gender: "Male", birthplace: "Delhi", residence: "Mumbai" } },
    { id: "grandmother", position: { x: 500, y: 0 }, type: "custom", data: { label: "Sushma Sharma", role: "Grandmother", age: "74", gender: "Female", birthplace: "Jaipur", residence: "Mumbai" } },
    { id: "father", position: { x: 200, y: 200 }, type: "custom", data: { label: "Amit Sharma", role: "Father", age: "52", gender: "Male", birthplace: "Mumbai", residence: "Mumbai" } },
    { id: "mother", position: { x: 400, y: 200 }, type: "custom", data: { label: "Neha Sharma", role: "Mother", age: "48", gender: "Female", birthplace: "Pune", residence: "Mumbai" } },
    { id: "uncle", position: { x: 600, y: 200 }, type: "custom", data: { label: "Sanjay Sharma", role: "Uncle", age: "50", gender: "Male", birthplace: "Mumbai", residence: "Delhi" } },
    { id: "aunt", position: { x: 800, y: 200 }, type: "custom", data: { label: "Pooja Sharma", role: "Aunt", age: "47", gender: "Female", birthplace: "Delhi", residence: "Delhi" } },
    { id: "me", position: { x: 150, y: 400 }, type: "custom", data: { label: "Nikhil Sharma", role: "You", age: "25", gender: "Male", birthplace: "Mumbai", residence: "Mumbai" } },
    { id: "brother", position: { x: 300, y: 400 }, type: "custom", data: { label: "Rohan Sharma", role: "Brother", age: "22", gender: "Male", birthplace: "Mumbai", residence: "Mumbai" } },
    { id: "sister", position: { x: 450, y: 400 }, type: "custom", data: { label: "Ananya Sharma", role: "Sister", age: "20", gender: "Female", birthplace: "Mumbai", residence: "Mumbai" } },
    { id: "cousin1", position: { x: 650, y: 400 }, type: "custom", data: { label: "Arjun Sharma", role: "Cousin", age: "18", gender: "Male", birthplace: "Delhi", residence: "Delhi" } },
    { id: "cousin2", position: { x: 800, y: 400 }, type: "custom", data: { label: "Priya Sharma", role: "Cousin", age: "16", gender: "Female", birthplace: "Delhi", residence: "Delhi" } },
    { id: "wife", position: { x: 150, y: 600 }, type: "custom", data: { label: "Sneha Sharma", role: "Wife", age: "24", gender: "Female", birthplace: "Goa", residence: "Mumbai" } },
    { id: "child", position: { x: 150, y: 800 }, type: "custom", data: { label: "Aarav Sharma", role: "Son", age: "2", gender: "Male", birthplace: "Mumbai", residence: "Mumbai" } },
  ];

  const initialEdges: Edge[] = [
    { id: "e1", source: "grandfather", target: "father", type: "straight" },
    { id: "e2", source: "grandmother", target: "father", type: "straight" },
    { id: "e3", source: "grandfather", target: "uncle", type: "straight" },
    { id: "e4", source: "grandmother", target: "uncle", type: "straight" },
    { id: "e5", source: "father", target: "me", type: "straight" },
    { id: "e6", source: "mother", target: "me", type: "straight" },
    { id: "e7", source: "father", target: "brother", type: "straight" },
    { id: "e8", source: "father", target: "sister", type: "straight" },
    { id: "e9", source: "uncle", target: "cousin1", type: "straight" },
    { id: "e10", source: "uncle", target: "cousin2", type: "straight" },
    { id: "e11", source: "me", target: "child", type: "straight" },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const handleAddNode = (parentId: string, data: PersonData) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newId = `${data.label}-${Date.now()}`;

    const newNode: Node<PersonData> = {
      id: newId,
      type: "custom",
      position: { x: parent.position.x, y: parent.position.y + 200 },
      data,
    };

    const newEdge: Edge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: "straight",
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
  };

  const handleEditNode = (nodeId: string, data: PersonData) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, data } : n))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  };

  const nodeTypes = {
    custom: (props: any) => (
      <CustomNode
        {...props}
        nodeId={props.id}
        onAddNode={handleAddNode}
        onEditNode={handleEditNode}
        onDeleteNode={handleDeleteNode}
      />
    ),
  };

  return (
    <div className="w-full h-[750px] bg-muted/40 rounded-xl border">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}