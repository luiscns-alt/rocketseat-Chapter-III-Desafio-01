import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const madePosts = postsPagination.results.map(post => {
    return {
      ...post,
      data: {
        ...post.data,
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  useEffect(() => {
    setPosts(madePosts);
  }, []);

  async function handleMorePages(): Promise<void> {
    const postsResults = await fetch(nextPage).then(res => res.json());
    setNextPage(postsResults.next_page);

    const newPosts = postsResults.results.map(post => {
      return {
        ...post,
        data: {
          ...post.data,
        },
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | Desafio Rockeseat</title>
      </Head>

      <main className={commonStyles.container}>
        <Header />
        <div className={styles.content__posts}>
          {posts.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong className={styles.title}>{post.data.title}</strong>
                  <p className={styles.subtitle}>{post.data.subtitle}</p>
                  <div className={styles.content__icons}>
                    <FiCalendar fontSize="2rem" />
                    <div className={styles.icon__text}>
                      {post.first_publication_date}
                    </div>
                    <FiUser fontSize="2rem" />
                    <div className={styles.icon__text}>{post.data.author}</div>
                  </div>
                </a>
              </Link>
            );
          })}

          {nextPage !== null && (
            <button type="button" onClick={handleMorePages}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
        content: post.data.content,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};
