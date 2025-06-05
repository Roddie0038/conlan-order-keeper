
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Filter, CalendarDays, User, Building } from "lucide-react";
import { Complaint } from "@/hooks/useFetchComplaints";

interface ComplaintManagementTableProps {
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-red-500 hover:bg-red-600';
    case 'in progress':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'resolved':
      return 'bg-green-500 hover:bg-green-600';
    case 'closed':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

const ITEMS_PER_PAGE = 10;

export function ComplaintManagementTable({ complaints, onViewComplaint }: ComplaintManagementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.store_number.includes(searchTerm) ||
      complaint.submitted_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.identified_concern.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || complaint.complaint_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get unique complaint types for filter
  const complaintTypes = [...new Set(complaints.map(c => c.complaint_type))];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {complaintTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[120px]">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Store
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Submitted By
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No complaints found
                </TableCell>
              </TableRow>
            ) : (
              paginatedComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm">
                    {new Date(complaint.date_submitted).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{complaint.store_name}</div>
                      <div className="text-xs text-gray-500">#{complaint.store_number}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{complaint.complaint_type}</TableCell>
                  <TableCell className="text-sm">{complaint.issue_type}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{complaint.submitted_by_name}</div>
                      <div className="text-xs text-gray-500">{complaint.submitted_by_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewComplaint(complaint)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
                className="w-10 h-10"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}
