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
const CARD_H = 120;

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

  const accentBorder =
    gender === "MALE"
      ? "#60a5fa"
      : gender === "FEMALE"
      ? "#f472b6"
      : "#34d399";

  return (
    <g>
      <foreignObject
        x={-CARD_W / 2}
        y={-CARD_H / 2 - 40}
        width={CARD_W}
        height={CARD_H + 100}
        style={{ overflow: "visible" }}
      >
        <div
          className="relative flex flex-col items-center group"
          style={{ width: CARD_W, pointerEvents: "all" }}
        >
          {/* ACTION BUTTONS */}

          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition">

            {canAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(member);
                }}
                className="w-7 h-7 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center hover:bg-emerald-50"
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
                className="w-7 h-7 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center hover:bg-emerald-50"
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
                className="w-7 h-7 rounded-full bg-white border border-red-200 shadow-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* MEMBER CARD */}

          <div
            onClick={() => onView(member)}
            className="mt-10 rounded-xl border border-emerald-200 bg-white shadow-sm hover:shadow-md transition p-3 flex flex-col items-center gap-1 cursor-pointer"
            style={{
              width: CARD_W,
              borderTopColor: accentBorder,
              borderTopWidth: 3,
            }}
          >
            {image ? (
              <img
                src={image}
                alt={nodeDatum.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                {nodeDatum.name.charAt(0)}
              </div>
            )}

            <p className="font-semibold text-xs truncate w-full text-center text-gray-800">
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

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <p className="text-lg font-medium text-gray-600">
          No family members yet
        </p>

        <button
          onClick={() => onAdd()}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus size={16} />
          Add First Member
        </button>
      </div>
    );
  }

  const data: RawNodeDatum =
    treeData.length === 1
      ? treeData[0]
      : { name: "Family", attributes: { id: "__root__" }, children: treeData };

  return (
    <div
      ref={containerRef}
      className="w-full h-[85vh] border border-emerald-200 bg-emerald-50"
     
    >
      <Tree
        data={data}
        orientation="vertical"
        translate={translate}
        pathFunc="step"
        nodeSize={{ x: 200, y: 180 }}
        renderCustomNodeElement={renderNode}
        collapsible
        zoomable
      />
    </div>
  );
};

export const FamilyTreeContent: React.FC = () => {

  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { activeFamily, addMember, editMember, deleteMember } =
    useFamilyContext();

  const members = activeFamily?.members ?? [];

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [deletingMember, setDeletingMember] =
    useState<FamilyMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);

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

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col">

      <div className="flex-1 overflow-auto">
        <TreeLayout
          members={members}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={() => {}}
        />
      </div>

      <MemberFormModal
        open={showMemberForm}
        onClose={() => setShowMemberForm(false)}
        onSubmit={handleMemberSubmit}
        existingMembers={members}
        editingMember={editingMember}
        defaultParentId={defaultParentId}
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

      {showCannotDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[340px] border border-emerald-200 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Cannot Delete Member
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              This member has children. Please remove or reassign them before
              deleting this member.
            </p>

            <button
              onClick={() => setShowCannotDeleteDialog(false)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};