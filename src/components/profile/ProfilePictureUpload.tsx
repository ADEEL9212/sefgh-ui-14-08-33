import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  avatar: string;
  name: string;
  onAvatarChange?: (url: string) => void;
}

export const ProfilePictureUpload = ({ avatar, name, onAvatarChange }: ProfilePictureUploadProps) => {
  const { uploadAvatar } = useUser();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const newAvatarUrl = await uploadAvatar(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onAvatarChange?.(newAvatarUrl);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.match(/^image\//)) {
      handleFileSelect(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or GIF)",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div
              className={`relative group cursor-pointer transition-all duration-200 ${
                isDragging ? 'scale-105 ring-2 ring-primary' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerFileInput}
            >
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={avatar} alt={name} className="object-cover" />
                <AvatarFallback className="text-2xl font-semibold bg-muted">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Change</span>
                </div>
              </div>
              
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center border-2 border-dashed border-primary">
                  <div className="text-primary text-center">
                    <Upload className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Drop here</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload progress */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                <div className="text-white text-center w-20">
                  <Progress value={uploadProgress} className="mb-2" />
                  <span className="text-xs">{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Click or drag to upload a new photo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or GIF • Max 1MB
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Photo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};