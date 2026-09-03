from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='video_url',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='Ancienne URL de la vidéo'),
        ),
        migrations.AddField(
            model_name='video',
            name='video_file',
            field=models.FileField(blank=True, null=True, upload_to='videos/', verbose_name='Fichier vidéo'),
        ),
    ]
