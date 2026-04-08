"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Upload, TreePine, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TreeVisualization from './TreeVisualization';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { toast } from 'sonner';
import { Spouse, Gender, FamilyMember } from '@/types';
import MemberFormModal from '../family-tree/member-form-modal';
import { getFamilyMemberByID, deleteFamilyMember } from '@/lib/actions/family-member.client';
import { DeleteMemberDialog } from '../family-tree/delete-member-modal';
import { ChildDeleteMemberModal } from '../family-tree/child-delete-member-modal';

const FamilyTreeApp: React.FC<{ data?: any; members?: any; currentUser?: any }> = ({ data, currentUser }: any) => {
  const { root, findNode, members, reloadData } = useFamilyTree(data);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'person' | 'spouse'>('person');
  const [addModal, setAddModal] = useState(false);
  const [addParentModal, setAddParentModal] = useState(false);
  const [addParentChildId, setAddParentChildId] = useState<string | null>(null);
  const [addChildModal, setAddChildModal] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [addSpouseModal, setAddSpouseModal] = useState(false);
  const [addSpouseNodeId, setAddSpouseNodeId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedData, setSelectedData] = useState<any>(null);

  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);

  const handleNodeClick = useCallback((id: string, type: 'person' | 'spouse') => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setSelectedType(type);
    }
  }, [selectedId]);

  // Fetch selected data when selectedId changes
  useEffect(() => {
    const fetchSelectedData = async () => {
      if (!selectedId) {
        setSelectedData(null);
        return;
      }

      try {
        let member = await getFamilyMemberByID(selectedId);

        if (!member) {
          setSelectedData(null);
          return;
        }

        const node = findNode(selectedId);
        if (node) {
          setSelectedData({ ...member, isSpouse: false });
          return;
        }

        // Check spouses
        const findSpouse = (n: typeof root): { spouse: Spouse; parentId: string } | null => {
          if (!n) return null;
          for (const s of n.spouses) {
            if (s.id === selectedId) return { spouse: s, parentId: n.id };
          }
          for (const c of n.children) {
            const found = findSpouse(c);
            if (found) return found;
          }
          return null;
        };

        const spouseResult = root ? findSpouse(root) : null;
        if (spouseResult) {
          setSelectedData({
            ...member,
            isSpouse: true,
            spouseType: spouseResult.spouse.type,
            parentId: spouseResult.parentId,
          });
        } else {
          setSelectedData(null);
        }
      } catch (error) {
        console.error('Error fetching selected data:', error);
        setSelectedData(null);
      }
    };

    fetchSelectedData();
  }, [selectedId]);

  // Find a parent node to add to (default to selected or root)
  const addParentId = selectedId && findNode(selectedId) ? selectedId : root?.parentId || '';
  const addParentName = findNode(addParentId)?.name || root?.name || '';

  const getNodeGender = (nodeId: string) => {
    // Check if it's a person node
    const personNode = findNode(nodeId);
    if (personNode) return personNode.gender;

    // Check if it's a spouse node
    const findSpouseGender = (n: typeof root): Gender | null => {
      if (!n) return null;
      for (const s of n.spouses) {
        if (s.id === nodeId) return s.gender;
      }
      for (const c of n.children) {
        const found = findSpouseGender(c);
        if (found) return found;
      }
      return null;
    };

    return root ? findSpouseGender(root) : null;
  };

  const handleDelete = (id: string) => {

    const hasChildren = members.some((m: any) => m.parentId === id)

    const member = members.find((m: any) => m.id === id);

    if (!member) return;

    setDeletingMember(member)

    if (hasChildren) {
      setShowCannotDeleteDialog(true);
      return;
    }

    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (!deletingMember) return;

    await deleteFamilyMember(deletingMember.id, deleteChildren);

    setShowDeleteDialog(false);
    setDeletingMember(null);
    reloadData();
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center gap-2">
          {selectedId && (
            <Button variant="outline" size="sm" onClick={() => setSelectedId(null)} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}

        </div>
      </motion.header>

      {/* Tree */}
      <div className="flex-1 flex items-center justify-center ">
        {root ? (
          <TreeVisualization
            data={root}
            onNodeClick={handleNodeClick}
            onEdit={(id, type) => {
              setSelectedId(id);
              setSelectedType(type);
              setEditModal(true);
            }}
            currentUser={currentUser}
            onDelete={handleDelete}
            onAddParent={(id) => {
              setAddParentChildId(id);
              setAddParentModal(true);
            }}
            onAdd={(id) => {
              setAddChildParentId(id);
              setAddChildModal(true);
            }}
            onAddSpouse={(id) => {
              setAddSpouseNodeId(id);
              setAddSpouseModal(true);
            }}
            onView={(id, type) => {
              const member = members.find((m: any) => m.id === id);
              if (member) {
                setViewingMember(member);
                setViewModal(true);
              }
            }}
            selectedId={selectedId}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-6 text-center"
          >
            <TreePine className="w-16 h-16 text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Your Family Tree is Empty</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Start building your family tree by adding the first member. Click "Add Member" to begin or import existing data.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setAddModal(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add First Member
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <MemberFormModal
        open={addModal}
        onClose={() => setAddModal(false)}
        existingMembers={members}
        defaultParentId={null}
        editingMember={null}
        parentName=""
        title="Add Family Member"
        description="Add a new member to your family tree"
        initialMode="person"
        parentGender={null}
        onSubmit={async (data) => {
          try {
            toast.success(`${data.name} added to family tree!`);
            setAddModal(false);
            reloadData()
          } catch (error) {
            console.error('Error creating member:', error);
            toast.error('Failed to add member');
          }
        }}
      />
      {selectedData && (
        <MemberFormModal
          open={editModal}
          onClose={() => { setEditModal(false); setSelectedId(null); }}
          existingMembers={members}
          defaultParentId={selectedData.isSpouse ? selectedData.parentId : null}
          editingMember={selectedData}
          parentName={selectedData?.parentId ? members.find((m: any) => m.id === selectedData.parentId)?.name : ""}
          title={selectedData.isSpouse ? "Edit Spouse" : "Edit Family Member"}
          description={selectedData.isSpouse ? "Update spouse information" : "Update member information"}
          initialMode={selectedData.isSpouse ? "spouse" : "person"}
          parentGender={selectedData.isSpouse && selectedData.parentId ? members.find((m: any) => m.id === selectedData.parentId)?.gender ?? null : null}
          onSubmit={async (data) => {
            try {
              toast.success(`${data.name} updated successfully!`);
              setEditModal(false);
              setSelectedId(null);
              reloadData();
            } catch (error) {
              console.error('Error updating member:', error);
              toast.error('Failed to update member');
            }
          }}
        />
      )}

      {/* View Details Modal */}
      {viewModal && viewingMember && (
        <MemberFormModal
          open={viewModal}
          onClose={() => { setViewModal(false); setViewingMember(null); }}
          existingMembers={members}
          defaultParentId={null}
          editingMember={viewingMember}
          parentName=""
          title="View Details"
          description="View family member details"
          initialMode="person"
          parentGender={null}
          readOnly={true}
          onSubmit={() => {}} // No submit for view
        />
      )}

      {/* Add Parent Modal */}
      {addParentModal && (
        <MemberFormModal
          open={addParentModal}
          onClose={() => { setAddParentModal(false); setAddParentChildId(null); }}
          existingMembers={members}
          defaultParentId={addParentChildId}
          editingMember={null}
          parentName={addParentChildId ? members.find((m: any) => m.id === addParentChildId)?.name : ""}
          title="Add Parent"
          description="Add a parent to this family member"
          initialMode="person"
          parentGender={null}
          onSubmit={async (data) => {
            try {
              toast.success(`${data.name} added as parent!`);
              setAddParentModal(false);
              setAddParentChildId(null);
              reloadData();
            } catch (error) {
              console.error('Error creating parent:', error);
              toast.error('Failed to add parent');
            }
          }}
        />
      )}

      {/* Add Child Modal */}
      {addChildModal && (
        <MemberFormModal
          open={addChildModal}
          onClose={() => { setAddChildModal(false); setAddChildParentId(null); }}
          existingMembers={members}
          defaultParentId={addChildParentId}
          editingMember={null}
          parentName={addChildParentId ? members.find((m: any) => m.id === addChildParentId)?.name : ""}
          title="Add Child"
          description="Add a child to this family member"
          initialMode="person"
          parentGender={addChildParentId ? members.find((m: any) => m.id === addChildParentId)?.gender : null}
          onSubmit={async (data) => {
            try {
              toast.success(`${data.name} added as child!`);
              setAddChildModal(false);
              setAddChildParentId(null);
              reloadData();
            } catch (error) {
              console.error('Error creating child:', error);
              toast.error('Failed to add child');
            }
          }}
        />
      )}


      {/* Add Spouse Modal */}
      {
        addSpouseModal && addSpouseNodeId && (<MemberFormModal
          open={addSpouseModal}
          onClose={() => setAddSpouseModal(false)}
          parentName={addSpouseNodeId ? findNode(addSpouseNodeId)?.name || 'Unknown' : 'Unknown'}
          title="Add Spouse"
          description={`Adding spouse to ${addSpouseNodeId ? findNode(addSpouseNodeId)?.name || 'Unknown' : 'Unknown'}`}
          initialMode="spouse"
          parentGender={addSpouseNodeId ? getNodeGender(addSpouseNodeId) ?? null : null}
          existingMembers={members}
          defaultParentId={addSpouseNodeId}
          editingMember={null}
          onSubmit={async (data) => {
            try {
              toast.success(`${data.name} added as spouse!`);
              setAddSpouseModal(false);
              setAddSpouseNodeId(null);
              reloadData();
            } catch (error) {
              console.error('Error creating spouse:', error);
              toast.error('Failed to add spouse');
            }
          }}
        />)
      }

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

export default FamilyTreeApp;
