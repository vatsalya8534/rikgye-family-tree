"use client";

import { useFamilyContext } from "@/context/FamilyContext";
import { FamilyMember } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tree, { RawNodeDatum, CustomNodeElementProps } from "react-d3-tree";
import { Plus, Pencil, Trash2 } from "lucide-react";

import MemberFormModal from "./member-form-modal";
import { DeleteMemberDialog } from "./delete-member-modal";

import { deleteFamilyMember, getSpouses } from "@/lib/actions/family-member";
import { getCurrentUser } from "@/lib/actions/user-action";
import { ChildDeleteMemberModal } from "./child-delete-member-modal";

const CARD_W = 150;
const CARD_H = 140;
const CONNECTOR_OFFSET = 1;

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
  const canDelete = isAdmin || isOwner;
  const isMale = member.gender === "MALE";

  const SPOUSE_GAP = 10; // spacing between cards

  const birthYear = member.birthDate
    ? new Date(member.birthDate).getFullYear()
    : "";
  const deathYear = member.deathDate
    ? new Date(member.deathDate).getFullYear()
    : "";

  const [spouses, setSpouses] = useState<any>([]);

  const getSpouse = async () => {
    const spouses = await getSpouses(member.id);
    setSpouses(spouses);
  }

  useEffect(() => {
    getSpouse()
  }, [])

  return (
    <>
      <g>
        <foreignObject
          x={-(CARD_W / 2)}
          y={-CARD_H / 2}
          width={CARD_W + 80}
          height={CARD_H}
          style={{ overflow: "visible" }}

        >
          <div className="relative group flex items-center h-full isolate">
            {/* ACTION PANEL */}
            <div
              className="absolute -right-[-20px] top-1/2 -translate-y-1/2 flex flex-col
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

              {canDelete && (

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(member);
                  }}
                  className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              )}
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
                      src={member.image[0] ?? ''}
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

        {spouses.map((spouse: any, index: number) => {
          const x = -((index + 1) * (CARD_W + SPOUSE_GAP)) - 75;

          const isFemale = spouse.gender === "FEMALE";

          return (

            <foreignObject
              key={index}
              x={x}
              y={-CARD_H / 2}
              width={CARD_W}   // ✅ IMPORTANT FIX
              height={CARD_H}
              style={{ overflow: "visible" }}
            >
              <div>
                <div
                  onClick={() => onView(spouse)}
                  className={`relative flex flex-col items-center cursor-pointer pt-12
              border-[3px] mr-20
              ${isFemale
                      ? "border-pink-400 bg-pink-100 rounded-[30px]"
                      : "border-blue-400 bg-blue-100 rounded-2xl"}
              shadow-lg hover:shadow-xl transition`}
                  style={{ width: CARD_W, height: CARD_H }}
                >

                  {/* IMAGE */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    {spouse.image?.length ? (
                      <img
                        src={spouse.image[0]}
                        className={`w-20 h-20 rounded-full object-cover border-[3px]
                    ${isFemale ? "border-pink-400" : "border-blue-400"}`}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center text-white">
                        {spouse.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-center">
                    {spouse.name}
                  </p>

                </div>
              </div>
            </foreignObject>

          );
        })}
      </g>


    </>

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

  // if (members.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-24 gap-6">
  //       <p className="text-lg font-medium">No family members yet</p>

  //       <button
  //         onClick={() => onAdd()}
  //         className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white"
  //       >
  //         <Plus size={16} />
  //         Add First Member
  //       </button>
  //     </div>
  //   );
  // }

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
        nodeSize={{ x: 150 * (members.length), y: 240 }}
        separation={{ siblings: 2, nonSiblings: 1.7 }}
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

  /* ---------------- INIT USER ---------------- */

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setCurrentUserId(user?.data?.id ?? null);
      setCurrentUserRole(user?.data?.role ?? null);
      setLoading(false);
    };

    init();
  }, []);

  /* ---------------- HANDLERS ---------------- */

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
    const hasChildren = members.some((m) => m.parentId === member.id)

    setDeletingMember(member)

    if (hasChildren) {
      setShowCannotDeleteDialog(true);
      return;
    }

    setShowDeleteDialog(true);
    setDeletingMember(member);
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

  /* ---------------- LOADING UI ---------------- */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Loading family tree...</p>
      </div>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */

  if (activeFamily && members.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <p className="text-lg font-medium">No family members yet</p>

          <button
            onClick={() => handleAdd()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white"
          >
            <Plus size={16} />
            Add First Member
          </button>
        </div>

        {/* ✅ KEEP MODAL HERE */}
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
      </>
    );
  }

  /* ---------------- TREE ---------------- */

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto px-6">
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
        parentName=""
        title="Edit Family Member"
        description="Update member information"
        initialMode="person"
        parentGender={null}
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

      {
        showCannotDeleteDialog && <ChildDeleteMemberModal open={showCannotDeleteDialog}
          member={deletingMember}
          hasChildren={false}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingMember(null);
          }}
          onConfirm={handleDeleteConfirm} />
      }
    </div>
  );
};