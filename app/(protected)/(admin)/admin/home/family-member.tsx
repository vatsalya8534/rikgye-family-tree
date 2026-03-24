"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Image from 'next/image';

const FamilyMembers = ({ data }: { data: any }) => {

    console.log(data);
    


    return (
        <div className="w-full">

            <Table className="w-full">

                <TableHeader className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-emerald-900 dark:text-emerald-200">
                            Image
                        </TableHead>

                        <TableHead className="font-semibold text-emerald-900 dark:text-emerald-200">
                            Name
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {data.map((d: any) => (
                        <TableRow
                            key={d.id}
                            className="hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors"
                        >

                            <TableCell className="font-medium text-foreground">
                                <Image src={d.image[0]} height={50} width={50} alt='' />
                            </TableCell>

                            <TableCell className="text-muted-foreground max-w-[400px] truncate">
                                {d.name}
                            </TableCell>

                        </TableRow>
                    ))}

                </TableBody>

            </Table>

        </div>
    )
}

export default FamilyMembers