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
const CONNECTOR_OFFSET = 6;

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
  const startY = source.y + CARD_H / 2 + CONNECTOR_OFFSET;

  const endX = target.x;
  const endY = target.y - CARD_H / 2 - CONNECTOR_OFFSET;

  const midY = (startY + endY) / 2;

  return `M ${startX},${startY} V ${midY} H ${endX} V ${endY}`;
};

/* ---------------- LINK STYLE ---------------- */

const getLinkClass = (linkDatum: any) => {
  const relation = linkDatum.target.data?.attributes?.relationType;

  if (relation === "EX") return "stroke-red";
  if (relation === "STEP") return "stroke-dashed";
  return "stroke-normal";
};

/* ---------------- NODE CARD ---------------- */

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
        <div className="relative group flex items-center h-full isolate">
          {/* ACTION PANEL */}
          <div
            className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2
            bg-white/80 backdrop-blur-xl border border-white/40
            shadow-xl rounded-xl p-2
            opacity-0 group-hover:opacity-100
            -translate-x-2 group-hover:translate-x-0
            transition-all duration-300 z-30"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(member);
              }}
              className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition"
            >
              <Plus size={14} />
            </button>

            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(member);
                }}
                className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition"
              >
                <Pencil size={14} />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(member);
              }}
              className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* CARD */}
          <div className="relative z-0">
            <div
              onClick={() => onView(member)}
              className={`relative flex flex-col items-center cursor-pointer pt-12
                backdrop-blur-xl overflow-visible z-10
                border-[3px]
                ${isMale
                  ? "border-blue-400 bg-gradient-to-br from-indigo-100/70 to-slate-100/60 rounded-2xl"
                  : "border-pink-400 bg-gradient-to-br from-pink-100/70 to-rose-100/60 rounded-[30px]"
                }
                shadow-lg hover:shadow-2xl transition`}
              style={{ width: CARD_W, height: CARD_H }}
            >

              {/* IMAGE */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-40">
                {member.image ? (
                  <img
                    src={member.image}
                    className={`w-20 h-20 rounded-full object-cover
                      border-[3px]
                      ${isMale ? "border-blue-400" : "border-pink-400"}
                      shadow-lg bg-white`}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white
                    border-[3px]
                    ${isMale ? "bg-blue-400 border-blue-500" : "bg-pink-400 border-pink-500"}
                    shadow-lg`}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold text-center">
                {member.name}
              </p>

              <p className="text-[11px] text-gray-600">
                {member.isAlive
                  ? birthYear
                  : `${birthYear} - ${deathYear || "—"}`}
              </p>

              <span className={`mt-1 text-[10px] px-2 py-[3px] rounded-full
                ${member.isAlive ? "bg-green-200" : "bg-red-200"}`}>
                {member.isAlive ? "Alive" : "Dead"}
              </span>
            </div>
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
  refreshKey,
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const treeData = useMemo(() => buildTree(members), [members, refreshKey]);

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
    [members, currentUserId, currentUserRole, refreshKey]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setTranslate({ x: width / 2, y: 120 });
  }, [members, refreshKey]);

  const data: RawNodeDatum =
    treeData.length === 1
      ? treeData[0]
      : { name: "Family", attributes: { id: "__root__" }, children: treeData };

  return (
    <div ref={containerRef} className="w-full h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Tree
        key={refreshKey}
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
        zoom={0.5}
      />
    </div>
  );
};

/* ---------------- MAIN ---------------- */

export const FamilyTreeContent = () => {
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { activeFamily, addMember, editMember, deleteMember } = useFamilyContext();
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

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleSubmit = (member: any) => {
    if (!activeFamily) return;
    editingMember ? editMember(activeFamily.id, member) : addMember(activeFamily.id, member);
    triggerRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!activeFamily || !deletingMember) return;
    await deleteFamilyMember(deletingMember.id, false);
    deleteMember(activeFamily.id, deletingMember.id, false);
    setShowDeleteDialog(false);
    triggerRefresh();
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col">

      <TreeLayout
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onAdd={(p: any) => { setEditingMember(null); setDefaultParentId(p?.id || null); setShowMemberForm(true); }}
        onEdit={(m: any) => { setEditingMember(m); setShowMemberForm(true); }}
        onDelete={(m: any) => { setDeletingMember(m); setShowDeleteDialog(true); }}
        onView={(m: any) => { setSelectedMember(m); setShowDetails(true); }}
        refreshKey={refreshKey}
      />

      {/* DETAILS MODAL */}
      {showDetails && selectedMember && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="relative w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* HEADER */}
      <div
        className={`h-28 ${
          selectedMember.gender === "MALE"
            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
            : "bg-gradient-to-r from-pink-500 to-rose-500"
        }`}
      >
        <button
          onClick={() => setShowDetails(false)}
          className="absolute top-3 right-3 text-white text-lg"
        >
          ✕
        </button>
      </div>

      {/* PROFILE IMAGE */}
      <div className="flex justify-center -mt-14">
        <img
          src={selectedMember.image || ""}
          className={`w-28 h-28 rounded-full object-cover border-[4px] ${
            selectedMember.gender === "MALE" ? "border-blue-400" : "border-pink-400"
          } bg-white`}
        />
      </div>

      {/* NAME + RELATION */}
      <div className="text-center mt-3">
        <h2 className="text-xl font-semibold">{selectedMember.name}</h2>
        <p className="text-xs text-gray-500">
          {selectedMember.relationType || "Family Member"}
        </p>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-3 p-6 text-sm">

        <div>Gender: {selectedMember.gender}</div>
        <div>Status: {selectedMember.isAlive ? "Alive" : "Dead"}</div>

        <div>Birth Date: {selectedMember.birthDate ? new Date(selectedMember.birthDate).toLocaleDateString() : "—"}</div>
        <div>Birth Place: {selectedMember.birthPlace || "—"}</div>

        {!selectedMember.isAlive && (
          <>
            <div>Death Date: {selectedMember.deathDate ? new Date(selectedMember.deathDate).toLocaleDateString() : "—"}</div>
            <div>Cause of Death: {selectedMember.causeOfDeath || "—"}</div>
          </>
        )}

        <div>Current Residence: {selectedMember.currentResidence || "—"}</div>
        <div>Profession: {selectedMember.profession || "—"}</div>

        <div>Marriage Date: {selectedMember.marriageDate ? new Date(selectedMember.marriageDate).toLocaleDateString() : "—"}</div>
        <div>Marriage Place: {selectedMember.marriagePlace || "—"}</div>


        

        <div>Email: {selectedMember.email || "—"}</div>
        <div>Phone: {selectedMember.phone || "—"}</div>

        <div className="col-span-2 text-xs break-all">ID: {selectedMember.id}</div>
        {selectedMember.parentId && (
          <div className="col-span-2 text-xs break-all">Parent ID: {selectedMember.parentId}</div>
        )}
      </div>
    </div>
  </div>
)}

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