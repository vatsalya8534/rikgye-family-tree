"use client";
import { useState, useCallback } from 'react';
import { FamilyNode, Spouse, Gender, SpouseType } from '@/types';
import { createFamilyMember } from '@/lib/actions/family-member';

let nextId = 100;
const genId = () => String(++nextId);

export function useFamilyTree(data: any) {
  const [root, setRoot] = useState<FamilyNode | null>(data || null);

  const findNode = useCallback((node: FamilyNode | null, id: string): FamilyNode | null => {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const updateTree = useCallback((node: FamilyNode | null, id: string, updater: (n: FamilyNode) => FamilyNode): FamilyNode | null => {
    if (!node) return null;
    if (node.id === id) return updater(node);
    return {
      ...node,
      children: node.children
        .map(c => updateTree(c, id, updater))
        .filter((c): c is FamilyNode => c !== null),
    };
  }, []);

  const createMember = (data: any) => {
    createFamilyMember(data).then((res) => {
      console.log(res);
    });
  };

  const addChild = useCallback((parentId: string, name: string, gender: Gender, birthYear?: number) => {
    setRoot(prev => {
      if (!prev) return prev;
      return updateTree(prev, parentId, node => ({
        ...node,
        children: [...node.children, { id: genId(), name, gender, birthYear, spouses: [], children: [] }],
      }));
    });
  }, [updateTree]);

  const addSpouse = useCallback((personId: string, name: string, gender: Gender, type: SpouseType, birthYear?: number) => {
    setRoot(prev => {
      if (!prev) return prev;
      return updateTree(prev, personId, node => ({
        ...node,
        spouses: [...node.spouses, { id: genId(), name, gender, type, birthYear }],
      }));
    });
  }, [updateTree]);

  const addParent = useCallback((childId: string, name: string, gender: Gender, birthYear?: number) => {
    setRoot(prev => {
      if (!prev) return prev;
      const newParentId = genId();
      const newParent: FamilyNode = {
        id: newParentId,
        name,
        gender,
        birthYear,
        spouses: [],
        children: []
      };

      // Function to find and replace the child node with the new parent
      const replaceWithParent = (node: FamilyNode): FamilyNode => {
        if (node.id === childId) {
          // Replace this node with the new parent, and make this node a child of the parent
          return {
            ...newParent,
            children: [node] // The original node becomes the first child
          };
        }

        // Check if the childId is in the spouses array
        const spouseIndex = node.spouses.findIndex(s => s.id === childId);
        if (spouseIndex !== -1) {
          const spouse = node.spouses[spouseIndex];
          // Convert spouse to a FamilyNode
          const spouseAsNode: FamilyNode = {
            id: spouse.id,
            name: spouse.name,
            gender: spouse.gender,
            birthYear: spouse.birthYear,
            spouses: [],
            children: []
          };

          // Create new parent with spouse as child
          const parentWithSpouse: FamilyNode = {
            ...newParent,
            children: [spouseAsNode]
          };

          // Remove spouse from original node and add the new parent as a spouse
          const updatedSpouses = [...node.spouses];
          updatedSpouses.splice(spouseIndex, 1);
          updatedSpouses.push({
            id: newParentId,
            name: newParent.name,
            gender: newParent.gender,
            type: 'current' as SpouseType,
            birthYear: newParent.birthYear
          });

          return {
            ...node,
            spouses: updatedSpouses
          };
        }

        return {
          ...node,
          children: node.children.map(replaceWithParent)
        };
      };

      return replaceWithParent(prev);
    });
  }, []);

  const updatePerson = useCallback((id: string, updates: { name?: string; gender?: Gender; birthYear?: number }) => {
    setRoot(prev => {
      if (!prev) return prev;
      // Check if it's a main node
      const updated = updateTree(prev, id, node => ({ ...node, ...updates }));
      if (!updated) return prev;
      // Also check spouses
      const updateSpouses = (node: FamilyNode): FamilyNode => ({
        ...node,
        spouses: node.spouses.map(s => s.id === id ? { ...s, ...updates } : s),
        children: node.children.map(updateSpouses),
      });
      return updateSpouses(updated);
    });
  }, [updateTree]);

  const updateSpouseType = useCallback((personId: string, spouseId: string, newType: SpouseType) => {
    setRoot(prev => {
      if (!prev) return prev;
      return updateTree(prev, personId, node => ({
        ...node,
        spouses: node.spouses.map(s => s.id === spouseId ? { ...s, type: newType } : s),
      }));
    });
  }, [updateTree]);

  const deletePerson = useCallback((id: string) => {
    setRoot(prev => {
      if (!prev || prev.id === id) return prev; // Can't delete root
      const removeFromTree = (node: FamilyNode): FamilyNode => ({
        ...node,
        spouses: node.spouses.filter(s => s.id !== id),
        children: node.children.filter(c => c.id !== id).map(removeFromTree),
      });
      return removeFromTree(prev);
    });
  }, []);

  const exportData = useCallback(() => JSON.stringify(root, null, 2), [root]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json) as FamilyNode;
      setRoot(data);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { root, findNode: (id: string) => findNode(root, id), createMember, addChild, addSpouse, addParent, updatePerson, updateSpouseType, deletePerson, exportData, importData };
}
