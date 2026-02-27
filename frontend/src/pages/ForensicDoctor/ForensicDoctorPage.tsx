import { useEffect, useState } from 'react';
import { forensicDoctorService } from '@/services/forensicDoctorService';
import { Evidence, EvidenceComment } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function ForensicDoctorPage() {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState<EvidenceComment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    forensicDoctorService.getBiologicalEvidence().then(setEvidenceList);
  }, []);

  const loadDetail = async (ev: Evidence) => {
    const detail = await forensicDoctorService.getEvidenceDetail(ev.id);
    setSelected(detail);
    setComment('');
    setEditingComment(null);
  };

  const handleSubmitComment = async () => {
    if (!selected || !comment.trim()) return;
    setLoading(true);
    try {
      if (editingComment) {
        await forensicDoctorService.updateComment(editingComment.id, comment);
      } else {
        await forensicDoctorService.addComment(selected.id, comment);
      }
      const updated = await forensicDoctorService.getEvidenceDetail(selected.id);
      setSelected(updated);
      setComment('');
      setEditingComment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!selected) return;
    await forensicDoctorService.deleteComment(commentId);
    const updated = await forensicDoctorService.getEvidenceDetail(selected.id);
    setSelected(updated);
  };

  const categoryBadgeColor: Record<string, string> = {
    blood: 'bg-red-100 text-red-700',
    hair: 'bg-yellow-100 text-yellow-700',
    fingerprint: 'bg-blue-100 text-blue-700',
    dna: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: Evidence List */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 font-semibold text-lg border-b">Biological Evidence</div>
        <ScrollArea className="flex-1">
          {evidenceList.map((ev) => (
            <div
              key={ev.id}
              onClick={() => loadDetail(ev)}
              className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${
                selected?.id === ev.id ? 'bg-muted' : ''
              }`}
            >
              <div className="font-medium text-sm">{ev.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{ev.case as string}</div>
              <div className="mt-1 flex gap-1 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    categoryBadgeColor[ev.evidence_category || 'other']
                  }`}
                >
                  {ev.evidence_category || 'other'}
                </span>
                {ev.verified_by_forensic_doctor && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a biological evidence item to view details
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            {/* Evidence Detail */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selected.title}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      categoryBadgeColor[selected.evidence_category || 'other']
                    }`}
                  >
                    {selected.evidence_category}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{selected.description}</p>
                {selected.verification_notes && (
                  <div className="mt-2 p-3 rounded bg-green-50 border border-green-200 text-green-800">
                    <strong>Verification Notes:</strong> {selected.verification_notes}
                  </div>
                )}
                <div className="flex gap-4 mt-3 flex-wrap">
                  {[selected.image1, selected.image2, selected.image3].map(
                    (img, i) =>
                      img && (
                        <img
                          key={i}
                          src={img as string}
                          alt={`Evidence image ${i + 1}`}
                          className="h-32 w-32 object-cover rounded border"
                        />
                      )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="mb-4 font-semibold">Analysis & Comments</div>
            <div className="space-y-3 mb-6">
              {(selected.comments as EvidenceComment[])?.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
              {(selected.comments as EvidenceComment[])?.map((c) => (
                <Card key={c.id}>
                  <CardContent className="pt-4 pb-3 text-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {c.author?.first_name} {c.author?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p>{c.comment}</p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingComment(c);
                          setComment(c.comment);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Add / Edit Comment */}
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {editingComment ? 'Edit Comment' : 'Add Analysis Comment'}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your forensic analysis here..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitComment} disabled={loading || !comment.trim()}>
                  {editingComment ? 'Update' : 'Submit'}
                </Button>
                {editingComment && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingComment(null);
                      setComment('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
