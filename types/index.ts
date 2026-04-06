import { cmsSchema, familyMemberSchema, userSchema } from "@/lib/validators";
import z from "zod";

export type User = z.infer<typeof userSchema>
export type CMS = z.infer<typeof cmsSchema>
export type FamilyMember = z.infer<typeof familyMemberSchema> & { id: string };

export interface Family {
id: string;
name: string;
members: FamilyMember[];
}

export type Gender = 'male' | 'female';
export type SpouseType = 'current' | 'ex';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
}

export interface Spouse {
  id: string;
  name: string;
  gender: Gender;
  type: SpouseType;
  birthYear?: number;
}

export interface FamilyNode {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  spouses: Spouse[];
  children: FamilyNode[];
}

export interface FamilyTreeData {
  root: FamilyNode | null;
}

