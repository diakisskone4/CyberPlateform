// Remplace la variable CLOUD_NAME et UPLOAD_PRESET par les tiennes
const CLOUDINARY_CLOUD_NAME = 'wsmctlkz'; // depuis le Dashboard Cloudinary
const CLOUDINARY_UPLOAD_PRESET = 'cyberwta_videos'; // le preset créé à l'étape 2

const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

const handleSaveVideo = async (e) => {
  e.preventDefault();
  setFormError('');

  try {
    let videoUrl = '';

    // 1) Si un fichier vidéo a été choisi, on l'envoie DIRECTEMENT à Cloudinary
    if (videoForm.video_file) {
      setIsUploading(true);
      const cloudForm = new FormData();
      cloudForm.append('file', videoForm.video_file);
      cloudForm.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: cloudForm }
      );
      const cloudData = await cloudRes.json();
      setIsUploading(false);

      if (!cloudData.secure_url) {
        setFormError("Échec de l'upload vidéo vers Cloudinary. Réessaie.");
        return;
      }
      videoUrl = cloudData.secure_url;
    }

    // 2) On envoie seulement les métadonnées + l'URL à Django (JSON, pas de fichier => plus de timeout)
    await coursesAPI.createVideo({
      chapter: selectedChapterId,
      title: videoForm.title,
      order: videoForm.order,
      duration_seconds: videoForm.duration_seconds,
      is_free_override: videoForm.is_free_override,
      video_url: videoUrl,
    });

    setVideoModalOpen(false);
    loadFullCertification(selectedCert.slug);
  } catch (err) {
    setIsUploading(false);
    setFormError(formatApiError(err));
  }
};
