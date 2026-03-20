"use client";

import { useFamilyContext } from "@/context/FamilyContext";
import { FamilyMember } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tree, { RawNodeDatum, CustomNodeElementProps } from "react-d3-tree";
import { Plus, Pencil, Trash2 } from "lucide-react";

import MemberFormModal from "./member-form-modal";
import { DeleteMemberDialog } from "./delete-member-modal";

import { deleteFamilyMember } from "@/lib/actions/family-member";
import { getCurrentUser } from "@/lib/actions/user-action";

/* ---------------- CONFIG ---------------- */

const CARD_W = 150;
const CARD_H = 180;

/* ---------------- TREE BUILDER ---------------- */

function buildTree(members: any[]): RawNodeDatum[] {
  const map = new Map<string, RawNodeDatum>();

  members.forEach((m) => {
    map.set(m.id, {
      name: m.name,
      attributes: { id: m.id, relationType: m.relationType },
      children: [],
    });
  });

  const roots: RawNodeDatum[] = [];

  members.forEach((m) => {
    const node = map.get(m.id);
    if (!node) return;

    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/* ---------------- PATH ---------------- */
const centeredStepPath = (linkDatum: any) => {
  const { source, target } = linkDatum;

  const startX = source.x;
  const startY = source.y + CARD_H / 2;

  const endX = target.x;
  const endY = target.y - CARD_H / 2;

  const midY = (startY + endY) / 2;

  return `
    M ${startX},${startY}
    V ${midY}
    H ${endX}
    V ${endY}
  `;
};


/* ---------------- LINK STYLE ---------------- */

const getLinkClass = (linkDatum: any) => {
  const relation = linkDatum.target.data?.attributes?.relationType;

  if (relation === "EX") return "stroke-red";
  if (relation === "STEP") return "stroke-dashed";
  return "stroke-normal";
};

/* ---------------- NODE CARD (UPDATED ONLY UI) ---------------- */

const NodeCard = ({
  nodeDatum,
  members,
  currentUserId,
  currentUserRole,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: any) => {
  const attrs = nodeDatum.attributes as Record<string, string>;
  const member = members.find((m: FamilyMember) => m.id === attrs?.id);
  if (!member) return null;

  const isAdmin = currentUserRole === "ADMIN";
  const isOwner = member.userId === currentUserId;

  const canEdit = isAdmin || isOwner;
  const isMale = member.gender === "MALE";

  const birthYear = member.birthDate
    ? new Date(member.birthDate).getFullYear()
    : "";

  const deathYear = member.deathDate
    ? new Date(member.deathDate).getFullYear()
    : "";

  return (
    <g>
      <foreignObject
        x={-CARD_W / 2}
        y={-CARD_H / 2}
        width={CARD_W + 80}
        height={CARD_H}
        style={{ overflow: "visible" }}
      >
        <div className="relative group flex items-center h-full ">

          {/* ACTION PANEL */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2
  bg-white/80 backdrop-blur-xl border border-white/40
  shadow-xl rounded-xl p-2
  opacity-0 group-hover:opacity-100
  -translate-x-2 group-hover:translate-x-0
  transition-all duration-300 z-20"
          >
            <button onClick={(e) => { e.stopPropagation(); onAdd(member) }} className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition">
              <Plus size={14} />
            </button>

            {canEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(member) }} className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition">
                <Pencil size={14} />
              </button>
            )}

            <button onClick={(e) => { e.stopPropagation(); onDelete(member) }} className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition">
              <Trash2 size={14} />
            </button>
          </div>

          {/* CARD */}
          <div
            onClick={() => onView(member)}
            className={` relative flex flex-col items-center cursor-pointer
              transition-all duration-300 ease-out
              hover:scale-105 
              border backdrop-blur-xl overflow-hidden
              ${isMale
                ? "bg-gradient-to-br from-indigo-100/70 to-slate-100/60 border-indigo-200 rounded-2xl"
                : "bg-gradient-to-br from-pink-100/70 to-rose-100/60 border-pink-200 rounded-[30px]"
              }
              shadow-lg hover:shadow-2xl`}
            style={{ width: CARD_W, height: CARD_H }}
          >

            {/* GLOW */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 blur-2xl
              ${isMale ? "bg-indigo-300/20" : "bg-pink-300/20"}`} />

            {/* TOP BAR */}
            <div className={`absolute top-0 left-0 w-full h-[5px]
              ${isMale ? "bg-indigo-500" : "bg-pink-500"}`} />

            {/* IMAGE */}
            <div className="mt-4">
              {member.image ? (
                <img
                  src={member.image}
                  className={`w-16 h-16 object-cover object-[center_20%] shadow-lg border-2 
                    ${isMale ? "rounded-xl border-indigo-400 " : "rounded-full border-pink-300"}`}
                />
              ) : (
                <div className={`w-16 h-16  flex items-center justify-center text-white font-bold shadow-lg
                  ${isMale ? "rounded-xl bg-indigo-400" : "rounded-full bg-pink-400"}`}>
                  {member.name.charAt(0)}
                </div>
              )}
            </div>

            {/* NAME */}
            <p className="mt-2 text-sm font-semibold text-gray-800 text-center px-2">
              {member.name}
            </p>

            {/* LIFE */}
            <p className="text-[11px] text-gray-600">
              {member.isAlive
                ? birthYear
                : `${birthYear} - ${deathYear || "—"}`}
            </p>

            {/* LOCATION */}
            {member.isAlive && member.currentResidence && (
              <p className="text-[10px] text-gray-500 truncate px-2">
                {member.currentResidence}
              </p>
            )}

            {/* PROFESSION */}
            {member.profession && (
              <p className="text-[10px] text-gray-400 truncate px-2">
                {member.profession}
              </p>
            )}

            {/* DEATH */}
            {!member.isAlive && member.causeOfDeath && (
              <p className="text-[10px] text-red-500 truncate px-2">
                {member.causeOfDeath}
              </p>
            )}

            {/* STATUS */}
            <span className={`absolute top-2 right-2 text-[10px] px-2 py-[3px] rounded-full
              ${member.isAlive ? "bg-green-200 text-green-700" : "bg-red-200 text-red-600"}`}>
              {member.isAlive ? "Alive" : "Dead"}
            </span>

          </div>
        </div>
      </foreignObject>
    </g>
  );
};

/* ---------------- TREE ---------------- */

const TreeLayout = ({
  members,
  currentUserId,
  currentUserRole,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: any) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const treeData = useMemo(() => buildTree(members), [members]);

  const renderNode = useCallback(
    (rd3Props: CustomNodeElementProps) => (
      <NodeCard
        {...rd3Props}
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    ),
    [members, currentUserId, currentUserRole]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 120 });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [members]);

  const data: RawNodeDatum =
    treeData.length === 1
      ? treeData[0]
      : { name: "Family", attributes: { id: "__root__" }, children: treeData };

  return (
    <div
      ref={containerRef}
      className="w-full h-[85vh]
      bg-gradient-to-br from-slate-50 via-white to-indigo-50"
    >
      <Tree
        data={data}
        orientation="vertical"
        translate={translate}
        pathFunc={centeredStepPath}
        pathClassFunc={getLinkClass}
        nodeSize={{ x: 280, y: 240 }}
        separation={{ siblings: 1.3, nonSiblings: 1.7 }}
        depthFactor={240}
        renderCustomNodeElement={renderNode}
        zoomable
        transitionDuration={400}
        collapsible={false}
      />
    </div>
  );
};

/* ---------------- MAIN ---------------- */

export const FamilyTreeContent = () => {
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { activeFamily, addMember, editMember, deleteMember } =
    useFamilyContext();

  const members = activeFamily?.members ?? [];

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      setCurrentUserId(user?.data?.id ?? null);
      setCurrentUserRole(user?.data?.role ?? null);
    };
    loadUser();
    setMounted(true);
  }, []);

  const handleAdd = (parent?: FamilyMember) => {
    setEditingMember(null);
    setDefaultParentId(parent?.id ?? null);
    setShowMemberForm(true);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleDelete = (member: FamilyMember) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  const handleSubmit = (member: any) => {
    if (!activeFamily) return;
    editingMember
      ? editMember(activeFamily.id, member)
      : addMember(activeFamily.id, member);
  };

  const handleDeleteConfirm = async () => {
    if (!activeFamily || !deletingMember) return;

    await deleteFamilyMember(deletingMember.id, false);
    deleteMember(activeFamily.id, deletingMember.id, false);

    setShowDeleteDialog(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col">
      <TreeLayout
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={() => { }}
      />

      <MemberFormModal
        open={showMemberForm}
        onClose={() => setShowMemberForm(false)}
        onSubmit={handleSubmit}
        existingMembers={members}
        editingMember={editingMember}
        defaultParentId={defaultParentId}
      />

      <DeleteMemberDialog
        open={showDeleteDialog}
        member={deletingMember}
        hasChildren={false}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};