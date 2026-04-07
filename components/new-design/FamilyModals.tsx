"use client";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, SpouseType } from '@/types';

type AddMode = 'child' | 'spouse';

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; gender: Gender; birthYear?: number; mode: AddMode; spouseType?: SpouseType }) => void;
  parentName: string;
  title?: string;
  description?: string;
  placeholder?: string;
  initialMode?: AddMode;
  parentGender?: Gender;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ open, onClose, onAdd, parentName, title, description, placeholder, initialMode, parentGender }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [birthYear, setBirthYear] = useState('');
  const [mode, setMode] = useState<AddMode>(initialMode || 'child');
  const [spouseType, setSpouseType] = useState<SpouseType>('current');

  console.log(gender);
  

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      // If adding a spouse and parent gender is known, set opposite gender
      if (initialMode === 'spouse' && parentGender) {
        setGender(parentGender === 'MALE' ? 'FEMALE' : 'MALE');
      }
    }
  }, [initialMode, open, parentGender]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      gender,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      mode,
      spouseType: mode === 'spouse' ? spouseType : undefined,
    });
    setName('');
    setBirthYear('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">{title || 'Add Family Member'}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description || `Adding relative to ${parentName}`}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Relationship</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as AddMode)}>
              <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === 'spouse' && (
            <div>
              <Label className="text-foreground">Spouse Type</Label>
              <Select value={spouseType} onValueChange={(v) => setSpouseType(v as SpouseType)}>
                <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current {gender === 'MALE' ? 'Husband' : 'Wife'}</SelectItem>
                  <SelectItem value="ex">Ex-{gender === 'MALE' ? 'Husband' : 'Wife'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-foreground">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={placeholder || "Full name"} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Gender {mode === 'spouse' && parentGender && '(Auto-selected)'}</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)} disabled={mode === 'spouse' && !!parentGender}>
              <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Birth Year (optional)</Label>
            <Input value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1990" type="number" className="bg-secondary border-border text-foreground" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditPersonModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; gender: Gender; birthYear?: number }) => void;
  onDelete: () => void;
  initialData: { name: string; gender: Gender; birthYear?: number };
  isSpouse?: boolean;
  spouseType?: SpouseType;
  onSpouseTypeChange?: (type: SpouseType) => void;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({ open, onClose, onSave, onDelete, initialData, isSpouse, spouseType, onSpouseTypeChange }) => {
  const [name, setName] = useState(initialData.name);
  const [gender, setGender] = useState<Gender>(initialData.gender);
  const [birthYear, setBirthYear] = useState(initialData.birthYear?.toString() || '');
  const [sType, setSType] = useState<SpouseType>(spouseType || 'current');

  React.useEffect(() => {
    setName(initialData.name);
    setGender(initialData.gender);
    setBirthYear(initialData.birthYear?.toString() || '');
    setSType(spouseType || 'current');
  }, [initialData, spouseType]);

  const handleSave = () => {
    onSave({ name: name.trim(), gender, birthYear: birthYear ? parseInt(birthYear) : undefined });
    if (isSpouse && onSpouseTypeChange && sType !== spouseType) {
      onSpouseTypeChange(sType);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Edit Person</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Birth Year</Label>
            <Input value={birthYear} onChange={e => setBirthYear(e.target.value)} type="number" className="bg-secondary border-border text-foreground" />
          </div>
          {isSpouse && (
            <div>
              <Label className="text-foreground">Relationship Status</Label>
              <Select value={sType} onValueChange={(v) => setSType(v as SpouseType)}>
                <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current {gender === 'MALE' ? 'Husband' : 'Wife'}</SelectItem>
                  <SelectItem value="ex">Ex-{gender === 'MALE' ? 'Husband' : 'Wife'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={() => { onDelete(); onClose(); }}>Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AddParentModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; gender: Gender; birthYear?: number }) => void;
  childName: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export const AddParentModal: React.FC<AddParentModalProps> = ({ 
  open, 
  onClose, 
  onAdd, 
  childName, 
  title = "Add Parent", 
  description, 
  placeholder = "Enter parent name" 
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [birthYear, setBirthYear] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      gender,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
    });
    setName('');
    setBirthYear('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description || `Adding to ${childName}`}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={placeholder} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Birth Year (optional)</Label>
            <Input value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1960" type="number" className="bg-secondary border-border text-foreground" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Add Parent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
