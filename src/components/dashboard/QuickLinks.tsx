import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

export default function QuickLinks() {
  const [links, setLinks] = useLocalStorage<QuickLink[]>('dashboard-quick-links', []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks([...links, { ...newLink, id: crypto.randomUUID() }]);
      setNewLink({ title: '', url: '' });
      setShowAddForm(false);
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="space-y-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-blue-400" />
          Quick Links
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline flex-1 truncate"
            >
              <LinkIcon className="h-4 w-4" />
              {link.title}
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
              onClick={() => removeLink(link.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {showAddForm ? (
          <div className="space-y-2">
            <Input
              placeholder="Link Title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={addLink} className="flex-1">Add</Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        )}
      </CardContent>
    </div>
  );
}