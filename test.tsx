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

/* ---------------- TREE BUILDER ---------------- */

function buildTree(members: FamilyMember[]): RawNodeDatum[] {
  const map = new Map<string, RawNodeDatum>();

  members.forEach((m) => {
    map.set(m.id, {
      name: m.name,
      attributes: {
        id: m.id,
        image: m.image,
        gender: m.gender ?? "",
        profession: m.profession ?? "",
        birthPlace: m.birthPlace ?? "",
        isAlive: m.isAlive ? "Yes" : "No",
      },
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

/* ---------------- NODE CARD ---------------- */

interface NodeCardProps {
  nodeDatum: RawNodeDatum;
  members: FamilyMember[];
  currentUserId: string | null;
  currentUserRole: string | null;
  onAdd: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  onView: (member: FamilyMember) => void;
}

const CARD_W = 140;
const CARD_H = 110;

const NodeCard: React.FC<NodeCardProps> = ({
  nodeDatum,
  members,
  currentUserId,
  currentUserRole,
  onAdd,
  onEdit,
  onDelete,
  onView,
}) => {
  const attrs = nodeDatum.attributes as Record<string, string>;
  const member = members.find((m) => m.id === attrs?.id);
  if (!member) return null;

  const isAdmin = currentUserRole === "ADMIN";
  const isOwner = member.userId === currentUserId;

  const canAdd = true;
  const canEdit = isAdmin || isOwner;
  const canDelete = isAdmin || isOwner;

  const gender = attrs?.gender ?? "";
  const image = attrs?.image ?? "";
  const profession = attrs?.profession ?? "";
  const birthPlace = attrs?.birthPlace ?? "";
  const isAlive = attrs?.isAlive ?? "Yes";

  const accent =
    gender === "MALE"
      ? "#3b82f6"
      : gender === "FEMALE"
      ? "#ec4899"
      : "#10b981";

  return (
    <g>
      <foreignObject
        x={-CARD_W / 2 - 60}
        y={-CARD_H / 2 - 20}
        width={CARD_W + 80}
        height={CARD_H + 60}
        style={{ overflow: "visible" }}
      >
        <div
          className="group flex items-center gap-2"
          style={{ pointerEvents: "all" }}
        >
          {/* ACTION BUTTONS LEFT */}
          <div className="flex flex-col gap-2 opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200">

            {canAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(member);
                }}
                className="w-7 h-7 rounded-full bg-emerald-500 text-white shadow hover:scale-110 flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            )}

            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(member);
                }}
                className="w-7 h-7 rounded-full bg-blue-500 text-white shadow hover:scale-110 flex items-center justify-center"
              >
                <Pencil size={14} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(member);
                }}
                className="w-7 h-7 rounded-full bg-red-500 text-white shadow hover:scale-110 flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* CARD */}
          <div
            onClick={() => onView(member)}
            className="rounded-xl bg-white border shadow-md hover:shadow-lg transition-all p-3 flex flex-col items-center gap-1.5 cursor-pointer"
            style={{
              width: CARD_W,
              borderTop: `4px solid ${accent}`,
            }}
          >
            {image ? (
              <img
                src={image}
                alt={nodeDatum.name}
                className="w-12 h-12 rounded-full object-cover border-2"
                style={{ borderColor: accent }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                👤
              </div>
            )}

            <p className="font-semibold text-xs truncate w-full text-center">
              {nodeDatum.name}
            </p>

            {profession && (
              <p className="text-[10px] text-gray-500">{profession}</p>
            )}

            {birthPlace && (
              <p className="text-[9px] text-gray-400">📍 {birthPlace}</p>
            )}

            <p
              className={`text-[10px] font-medium ${
                isAlive === "Yes" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isAlive === "Yes" ? "Alive" : "Deceased"}
            </p>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

/* ---------------- TREE LAYOUT ---------------- */

interface TreeLayoutProps {
  members: FamilyMember[];
  currentUserId: string | null;
  currentUserRole: string | null;
  onAdd: (member?: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  onView: (member: FamilyMember) => void;
}

const TreeLayout: React.FC<TreeLayoutProps> = ({
  members,
  currentUserId,
  currentUserRole,
  onAdd,
  onEdit,
  onDelete,
  onView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const treeData = useMemo(() => buildTree(members), [members]);

  const renderNode = useCallback(
    (rd3Props: CustomNodeElementProps) => (
      <NodeCard
        nodeDatum={rd3Props.nodeDatum}
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
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setTranslate({ x: width / 2, y: 120 });
  }, [members]);

  const data: RawNodeDatum =
    treeData.length === 1
      ? treeData[0]
      : { name: "Family", attributes: { id: "__root__" }, children: treeData };

  return (
    <div
      ref={containerRef}
      className="w-full flex-1"
      style={{ height: "calc(100vh - 160px)", minHeight: 400 }}
    >
      <Tree
        data={data}
        orientation="vertical"
        translate={translate}
        pathFunc="step"
        nodeSize={{ x: 220, y: 180 }}
        renderCustomNodeElement={renderNode}
        collapsible
        zoomable
      />
    </div>
  );
};

/* ---------------- MAIN ---------------- */

export const FamilyTreeContent: React.FC = () => {
  const { activeFamily, addMember, editMember, deleteMember } =
    useFamilyContext();

  const members = activeFamily?.members ?? [];

  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [viewMember, setViewMember] = useState<FamilyMember | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setCurrentUserId(user?.data?.id ?? null);
      setCurrentUserRole(user?.data?.role ?? null);
      setLoading(false);
    };

    init();
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
    const hasChildren = members.some((m) => m.parentId === member.id);

    if (hasChildren) {
      setShowCannotDeleteDialog(true);
      return;
    }

    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  const handleMemberSubmit = (member: any) => {
    if (!activeFamily) return;

    if (editingMember) editMember(activeFamily.id, member);
    else addMember(activeFamily.id, member);
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (!activeFamily || !deletingMember) return;

    await deleteFamilyMember(deletingMember.id, deleteChildren);
    deleteMember(activeFamily.id, deletingMember.id, deleteChildren);

    setShowDeleteDialog(false);
    setDeletingMember(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <p className="text text-gray-500">Loading family tree...</p>
      </div>
    );
  }

  if (activeFamily && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <p className="text-lg font-medium">No family members yet</p>

        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Add First Member
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto px-6 py-4">
        <TreeLayout
          members={members}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={setViewMember}
        />
      </div>

      <MemberFormModal
        open={showMemberForm}
        onClose={() => setShowMemberForm(false)}
        onSubmit={handleMemberSubmit}
        existingMembers={members}
        editingMember={editingMember}
        defaultParentId={defaultParentId}
        parentName={defaultParentId ? (members.find((m) => m.id === defaultParentId)?.name ?? "") : ""}
        title={editingMember ? "Edit Member" : "Add Family Member"}
        description={editingMember ? "Update member information" : "Add a new member to your family tree"}
        initialMode="person"
        parentGender={defaultParentId ? (members.find((m) => m.id === defaultParentId)?.gender ?? null) : null}
      />

      <DeleteMemberDialog
        open={showDeleteDialog}
        member={deletingMember}
        hasChildren={false}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingMember(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};